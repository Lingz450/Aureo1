-- Company member management policies
-- Enables:
-- - Creating a company workspace (creator can add themselves as owner)
-- - Owners can invite/add teammates
-- - Members can read their company roster (needed for employer dashboard/team features)

alter table public.company_members enable row level security;

-- Members can read all members in their company (not just their own row)
do $$ begin
  create policy "company members read company roster"
  on public.company_members for select
  using (
    exists (
      select 1 from public.company_members m
      where m.company_id = company_id and m.user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

-- Company creator can add themselves as the first owner member
do $$ begin
  create policy "company members insert by company creator"
  on public.company_members for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.companies c
      where c.id = company_id and c.created_by = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

-- Owners can add members (including other owners) to their company
do $$ begin
  create policy "company members insert by owners"
  on public.company_members for insert
  with check (
    exists (
      select 1 from public.company_members m
      where m.company_id = company_id and m.user_id = auth.uid() and m.member_role = 'owner'
    )
  );
exception when duplicate_object then null; end $$;

-- Owners can update member roles
do $$ begin
  create policy "company members update by owners"
  on public.company_members for update
  using (
    exists (
      select 1 from public.company_members m
      where m.company_id = company_id and m.user_id = auth.uid() and m.member_role = 'owner'
    )
  )
  with check (
    exists (
      select 1 from public.company_members m
      where m.company_id = company_id and m.user_id = auth.uid() and m.member_role = 'owner'
    )
  );
exception when duplicate_object then null; end $$;

-- Owners can remove members
do $$ begin
  create policy "company members delete by owners"
  on public.company_members for delete
  using (
    exists (
      select 1 from public.company_members m
      where m.company_id = company_id and m.user_id = auth.uid() and m.member_role = 'owner'
    )
  );
exception when duplicate_object then null; end $$;







