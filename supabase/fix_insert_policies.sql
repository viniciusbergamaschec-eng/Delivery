-- Permite que qualquer usuário autenticado crie UMA loja (durante o cadastro)
create policy "Usuário autenticado pode criar loja"
  on lojas for insert
  to authenticated
  with check (true);

-- Permite que o usuário crie o próprio vínculo de lojista
create policy "Usuário cria o próprio vínculo de lojista"
  on lojistas for insert
  to authenticated
  with check (id = auth.uid());
