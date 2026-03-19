-- Extension pour UUID
create extension if not exists "uuid-ossp";

-- Table des profils artisans
create table public.profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  nom_entreprise text not null default '',
  siret text not null default '',
  adresse text not null default '',
  telephone text not null default '',
  email text not null default '',
  logo_url text,
  garantie_decennale text,
  mentions_legales text,
  taux_tva numeric(5,2) not null default 20.00,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Table des prestations (catalogue artisan)
create table public.prestations (
  id uuid default uuid_generate_v4() primary key,
  artisan_id uuid references auth.users(id) on delete cascade not null,
  nom text not null,
  description text,
  prix_unitaire numeric(10,2) not null,
  unite text not null default 'forfait' check (unite in ('h', 'forfait', 'm²', 'pièce', 'ml', 'kg')),
  created_at timestamptz default now() not null
);

-- Table des clients
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  artisan_id uuid references auth.users(id) on delete cascade not null,
  nom text not null,
  email text,
  adresse text,
  telephone text,
  created_at timestamptz default now() not null
);

-- Table des devis
create table public.devis (
  id uuid default uuid_generate_v4() primary key,
  reference text not null,
  artisan_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  statut text not null default 'brouillon' check (statut in ('brouillon', 'envoye', 'vu', 'accepte', 'refuse')),
  date_creation date not null default current_date,
  date_validite date not null default (current_date + interval '30 days'),
  description_chantier text not null default '',
  adresse_chantier text,
  total_ht numeric(10,2) not null default 0,
  taux_tva numeric(5,2) not null default 20.00,
  total_tva numeric(10,2) not null default 0,
  total_ttc numeric(10,2) not null default 0,
  conditions_reglement text default 'Paiement à 30 jours',
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Table des lignes de devis
create table public.devis_lignes (
  id uuid default uuid_generate_v4() primary key,
  devis_id uuid references public.devis(id) on delete cascade not null,
  description text not null,
  quantite numeric(10,2) not null default 1,
  unite text not null default 'forfait',
  prix_unitaire numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  ordre integer not null default 0
);

-- Index pour les performances
create index idx_profiles_user_id on public.profiles(user_id);
create index idx_prestations_artisan_id on public.prestations(artisan_id);
create index idx_clients_artisan_id on public.clients(artisan_id);
create index idx_devis_artisan_id on public.devis(artisan_id);
create index idx_devis_client_id on public.devis(client_id);
create index idx_devis_lignes_devis_id on public.devis_lignes(devis_id);
create index idx_devis_statut on public.devis(statut);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.prestations enable row level security;
alter table public.clients enable row level security;
alter table public.devis enable row level security;
alter table public.devis_lignes enable row level security;

-- Policies pour profiles
create policy "Les utilisateurs peuvent voir leur propre profil"
  on public.profiles for select using (auth.uid() = user_id);
create policy "Les utilisateurs peuvent mettre à jour leur propre profil"
  on public.profiles for update using (auth.uid() = user_id);
create policy "Les utilisateurs peuvent créer leur propre profil"
  on public.profiles for insert with check (auth.uid() = user_id);

-- Policies pour prestations
create policy "Les artisans peuvent voir leurs propres prestations"
  on public.prestations for select using (auth.uid() = artisan_id);
create policy "Les artisans peuvent créer leurs propres prestations"
  on public.prestations for insert with check (auth.uid() = artisan_id);
create policy "Les artisans peuvent modifier leurs propres prestations"
  on public.prestations for update using (auth.uid() = artisan_id);
create policy "Les artisans peuvent supprimer leurs propres prestations"
  on public.prestations for delete using (auth.uid() = artisan_id);

-- Policies pour clients
create policy "Les artisans peuvent voir leurs propres clients"
  on public.clients for select using (auth.uid() = artisan_id);
create policy "Les artisans peuvent créer leurs propres clients"
  on public.clients for insert with check (auth.uid() = artisan_id);
create policy "Les artisans peuvent modifier leurs propres clients"
  on public.clients for update using (auth.uid() = artisan_id);
create policy "Les artisans peuvent supprimer leurs propres clients"
  on public.clients for delete using (auth.uid() = artisan_id);

-- Policies pour devis
create policy "Les artisans peuvent voir leurs propres devis"
  on public.devis for select using (auth.uid() = artisan_id);
create policy "Les artisans peuvent créer leurs propres devis"
  on public.devis for insert with check (auth.uid() = artisan_id);
create policy "Les artisans peuvent modifier leurs propres devis"
  on public.devis for update using (auth.uid() = artisan_id);
create policy "Les artisans peuvent supprimer leurs propres devis"
  on public.devis for delete using (auth.uid() = artisan_id);

-- Policies pour devis_lignes (via devis ownership)
create policy "Les artisans peuvent voir les lignes de leurs devis"
  on public.devis_lignes for select using (
    exists (select 1 from public.devis where devis.id = devis_lignes.devis_id and devis.artisan_id = auth.uid())
  );
create policy "Les artisans peuvent créer des lignes dans leurs devis"
  on public.devis_lignes for insert with check (
    exists (select 1 from public.devis where devis.id = devis_lignes.devis_id and devis.artisan_id = auth.uid())
  );
create policy "Les artisans peuvent modifier les lignes de leurs devis"
  on public.devis_lignes for update using (
    exists (select 1 from public.devis where devis.id = devis_lignes.devis_id and devis.artisan_id = auth.uid())
  );
create policy "Les artisans peuvent supprimer les lignes de leurs devis"
  on public.devis_lignes for delete using (
    exists (select 1 from public.devis where devis.id = devis_lignes.devis_id and devis.artisan_id = auth.uid())
  );

-- Fonction pour créer automatiquement un profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Trigger pour création automatique du profil
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Fonction pour mettre à jour updated_at
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger update_devis_updated_at
  before update on public.devis
  for each row execute procedure public.update_updated_at();
