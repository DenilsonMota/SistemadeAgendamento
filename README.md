Sistema de Agendamento para Serviços: Estética & Bem-Estar

Este é o protótipo funcional de um Sistema de Agendamento Single Page Application (SPA), desenvolvido em React e estilizado com Tailwind CSS, conforme os requisitos do projeto.

1. Implementação Técnica

Front-end

Framework: React (usando hooks e componentes funcionais).

Estilização: Tailwind CSS, garantindo um design moderno e responsivo (mobile-friendly).

Estrutura: O sistema é uma SPA (Single Page Application), navegando entre Home, Login, Cadastro e Dashboard sem recarregar a página.

Back-end (Simulado para fins de demonstração)

Para cumprir o requisito de um "Back-end funcional" em um ambiente de entrega simples, foi implementado um Mock Backend.

Persistência de Dados: Em vez de um banco de dados real (como MySQL ou MongoDB), todos os dados (clientes e agendamentos) são armazenados no localStorage do navegador.

Vantagem: O sistema simula a persistência de um banco de dados: se você fechar a aba e reabrir, os dados continuam salvos.

Refatoração para Produção: Na vida real, o objeto mockBackend seria substituído por chamadas fetch a uma API REST (Node.js/Express, Python/Flask, etc.).

2. Funcionalidades Implementadas

Funcionalidade

Descrição

Status de Implementação

Página Institucional

Tela Home (/) com apresentação dos serviços e informações de contato.

Completo

Cadastro de Clientes

Usuários podem criar contas com Nome, E-mail e Senha (salvos localmente).

Completo

Simular Reserva

Usuário logado agenda um serviço (Data/Hora). O status inicial é Pendente.

Completo

Cancelamento

Clientes podem cancelar suas próprias reservas pendentes.

Completo

Confirmação/Aprovação

O Administrador aprova ou cancela agendamentos pendentes.

Completo

3. Credenciais de Acesso (Teste)

Para demonstrar a funcionalidade de Confirmação/Aprovação (Modo Admin), utilize as seguintes credenciais:

Perfil

E-mail

Senha

Cliente

Crie um novo cadastro

(Sua senha)

Administrador

admin@sistema.com

admin
