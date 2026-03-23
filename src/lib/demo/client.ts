import { demoProfile, demoClients, demoDevis, demoPrestations, demoFactures, DEMO_USER_ID } from './data'

type TableName = 'profiles' | 'clients' | 'devis' | 'factures' | 'prestations' | 'devis_lignes' | 'facture_lignes'

function getTableData(table: TableName): any[] {
  switch (table) {
    case 'profiles': return [demoProfile]
    case 'clients': return [...demoClients]
    case 'devis': return [...demoDevis]
    case 'factures': return [...demoFactures]
    case 'prestations': return [...demoPrestations]
    case 'devis_lignes': return demoDevis.flatMap(d => d.lignes || [])
    case 'facture_lignes': return demoFactures.flatMap(f => f.lignes || [])
    default: return []
  }
}

function createQueryBuilder(table: TableName) {
  let data: any[] = getTableData(table)
  const filters: Array<{ col: string; val: any }> = []
  let selectColumns = '*'
  let orderCol = ''
  let orderAsc = true
  let isSingle = false

  const builder = {
    select(cols?: string) {
      if (cols) selectColumns = cols
      return builder
    },
    eq(col: string, val: string | number) {
      filters.push({ col, val })
      return builder
    },
    order(col: string, opts?: { ascending?: boolean }) {
      orderCol = col
      orderAsc = opts?.ascending ?? true
      return builder
    },
    single() {
      isSingle = true
      return builder.then()
    },
    insert(rows: any) {
      const arr = Array.isArray(rows) ? rows : [rows]
      data = [...data, ...arr]
      return { data: arr, error: null, select: () => ({ data: arr, error: null, single: () => ({ data: arr[0], error: null }) }) }
    },
    update(vals: any) {
      return {
        eq: (col: string, val: string | number) => {
          const item = data.find(d => d[col] === val)
          const updated = item ? { ...item, ...vals } : vals
          return { data: updated, error: null, select: () => ({ data: [updated], error: null, single: () => ({ data: updated, error: null }) }) }
        }
      }
    },
    delete() {
      return {
        eq: () => ({ data: null, error: null })
      }
    },
    upsert(rows: any) {
      const arr = Array.isArray(rows) ? rows : [rows]
      return { data: arr, error: null, select: () => ({ data: arr, error: null, single: () => ({ data: arr[0], error: null }) }) }
    },
    then(resolve?: (value: any) => any, reject?: (reason: any) => any) {
      let result = [...data]
      for (const f of filters) {
        result = result.filter(d => d[f.col] === f.val)
      }
      if (orderCol) {
        result.sort((a, b) => {
          if (orderAsc) return a[orderCol] > b[orderCol] ? 1 : -1
          return a[orderCol] < b[orderCol] ? 1 : -1
        })
      }

      // Handle joined selects like '*, client:clients(*)'
      if (selectColumns.includes('client:clients')) {
        result = result.map(item => ({
          ...item,
          client: demoClients.find(c => c.id === item.client_id) || null,
        }))
      }

      const response = isSingle
        ? { data: result[0] || null, error: null }
        : { data: result, error: null }

      const promise = Promise.resolve(response)
      return resolve ? promise.then(resolve, reject) : promise
    },
  }

  return builder
}

export function createDemoClient() {
  return {
    from: (table: string) => createQueryBuilder(table as TableName),
    auth: {
      getUser: () => Promise.resolve({
        data: {
          user: {
            id: DEMO_USER_ID,
            email: 'admin@prospecthunter.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: '2024-01-15T10:00:00Z',
          }
        },
        error: null,
      }),
      getSession: () => Promise.resolve({
        data: {
          session: {
            access_token: 'demo-token',
            refresh_token: 'demo-refresh',
            user: {
              id: DEMO_USER_ID,
              email: 'admin@prospecthunter.com',
            }
          }
        },
        error: null,
      }),
      signInWithPassword: ({ email }: { email: string; password: string }) => {
        return Promise.resolve({
          data: {
            user: { id: DEMO_USER_ID, email },
            session: { access_token: 'demo-token' },
          },
          error: null,
        })
      },
      signUp: ({ email }: { email: string; password: string; options?: unknown }) => {
        return Promise.resolve({
          data: { user: { id: DEMO_USER_ID, email }, session: null },
          error: null,
        })
      },
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: { path: 'demo/logo.png' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  }
}
