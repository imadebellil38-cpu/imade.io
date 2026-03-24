// LocalDB: localStorage-based mock of Supabase client
// Allows the app to work without a Supabase backend

const PREFIX = 'empire_db_';
let counter = Date.now();

function uid() {
  return (++counter).toString(36) + Math.random().toString(36).slice(2, 6);
}

function getTable(name) {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + name)) || [];
  } catch {
    return [];
  }
}

function setTable(name, rows) {
  localStorage.setItem(PREFIX + name, JSON.stringify(rows));
}

function matchFilters(row, filters) {
  return filters.every(f => {
    const val = row[f.col];
    switch (f.op) {
      case 'eq': return val === f.val;
      case 'gte': return val >= f.val;
      case 'lte': return val <= f.val;
      case 'gt': return val > f.val;
      case 'lt': return val < f.val;
      default: return true;
    }
  });
}

class QueryBuilder {
  constructor(table) {
    this._table = table;
    this._filters = [];
    this._order = null;
    this._limit = null;
    this._single = false;
    this._head = false;
    this._count = null;
    this._selectCols = '*';
    this._op = null; // 'select', 'insert', 'update', 'delete', 'upsert'
    this._payload = null;
    this._onConflict = null;
  }

  select(cols, opts) {
    this._op = this._op || 'select';
    this._selectCols = cols || '*';
    if (opts?.count) this._count = opts.count;
    if (opts?.head) this._head = true;
    return this;
  }

  insert(data) {
    this._op = 'insert';
    this._payload = Array.isArray(data) ? data : [data];
    return this;
  }

  upsert(data, opts) {
    this._op = 'upsert';
    this._payload = Array.isArray(data) ? data : [data];
    this._onConflict = opts?.onConflict;
    return this;
  }

  update(data) {
    this._op = 'update';
    this._payload = data;
    return this;
  }

  delete() {
    this._op = 'delete';
    return this;
  }

  eq(col, val) { this._filters.push({ col, op: 'eq', val }); return this; }
  gte(col, val) { this._filters.push({ col, op: 'gte', val }); return this; }
  lte(col, val) { this._filters.push({ col, op: 'lte', val }); return this; }
  gt(col, val) { this._filters.push({ col, op: 'gt', val }); return this; }
  lt(col, val) { this._filters.push({ col, op: 'lt', val }); return this; }

  order(col, opts) {
    this._order = { col, ascending: opts?.ascending ?? true };
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  single() {
    this._single = true;
    return this;
  }

  then(resolve, reject) {
    try {
      resolve(this._execute());
    } catch (e) {
      if (reject) reject(e);
    }
  }

  _execute() {
    let rows = getTable(this._table);

    switch (this._op) {
      case 'insert': {
        const defaults = { is_active: true };
        const inserted = this._payload.map(row => ({
          id: row.id || uid(),
          created_at: new Date().toISOString(),
          ...defaults,
          ...row
        }));
        rows = [...rows, ...inserted];
        setTable(this._table, rows);
        const data = this._single ? inserted[0] : inserted;
        return { data, error: null, count: inserted.length };
      }

      case 'upsert': {
        const conflictCols = this._onConflict ? this._onConflict.split(',').map(s => s.trim()) : ['id'];
        const upserted = [];
        for (const item of this._payload) {
          const idx = rows.findIndex(r => conflictCols.every(c => r[c] === item[c]));
          const row = { id: uid(), created_at: new Date().toISOString(), ...item };
          if (idx >= 0) {
            rows[idx] = { ...rows[idx], ...item };
            upserted.push(rows[idx]);
          } else {
            rows.push(row);
            upserted.push(row);
          }
        }
        setTable(this._table, rows);
        const data = this._single ? upserted[0] : upserted;
        return { data, error: null };
      }

      case 'update': {
        let updated = null;
        rows = rows.map(r => {
          if (matchFilters(r, this._filters)) {
            updated = { ...r, ...this._payload };
            return updated;
          }
          return r;
        });
        setTable(this._table, rows);
        return { data: updated, error: null };
      }

      case 'delete': {
        rows = rows.filter(r => !matchFilters(r, this._filters));
        setTable(this._table, rows);
        return { data: null, error: null };
      }

      case 'select':
      default: {
        let result = rows.filter(r => matchFilters(r, this._filters));

        // Handle joined selects like '*, members(pseudo, avatar_emoji)'
        if (this._selectCols && this._selectCols.includes('(')) {
          result = result.map(r => {
            const copy = { ...r };
            const joinMatches = this._selectCols.matchAll(/(\w+)\(([^)]+)\)/g);
            for (const m of joinMatches) {
              const joinTable = m[1];
              const joinRows = getTable(joinTable);
              const fk = joinTable.slice(0, -1) + '_id'; // members -> member_id
              const joined = joinRows.find(jr => jr.id === r[fk]);
              if (joined) {
                const cols = m[2].split(',').map(c => c.trim());
                copy[joinTable] = {};
                for (const c of cols) copy[joinTable][c] = joined[c];
              } else {
                copy[joinTable] = null;
              }
            }
            return copy;
          });
        }

        if (this._order) {
          const { col, ascending } = this._order;
          result.sort((a, b) => {
            if (a[col] < b[col]) return ascending ? -1 : 1;
            if (a[col] > b[col]) return ascending ? 1 : -1;
            return 0;
          });
        }

        if (this._limit) result = result.slice(0, this._limit);

        if (this._head) {
          return { data: null, error: null, count: result.length };
        }

        if (this._single) {
          return { data: result[0] || null, error: result.length ? null : { code: 'PGRST116' } };
        }

        return { data: result, error: null, count: result.length };
      }
    }
  }
}

export function createLocalClient() {
  return {
    from(table) {
      return new QueryBuilder(table);
    },
    channel() {
      return {
        on() { return this; },
        subscribe() { return this; }
      };
    },
    removeChannel() {}
  };
}
