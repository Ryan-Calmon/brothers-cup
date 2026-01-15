# Brothers Cup - Gerenciador de Torneios de Futevôlei

## Descrição do Projeto

O Brothers Cup é um sistema  projetado para otimizar a gestão de torneios de futevôlei. Sua principal finalidade é simplificar o processo de organização, desde a inscrição de atletas até o acompanhamento detalhado dos pagamentos. A plataforma oferece uma UX que atende tanto às necessidades dos atletas, que buscam uma facilidade na inscrição e acesso a informações do torneio, quanto às dos administradores, que necessitam de controle total sobre as inscrições, gerenciamento de vagas e visibilidade completa sobre o evento.

## Funcionalidades

### Para Atletas e Usuários

Os atletas e usuários do sistema Brothers Cup têm acesso a um conjunto de funcionalidades que enriquecem sua experiência no torneio:

*   **Inscrição e Processamento de Pagamento:** O sistema permite que os atletas realizem suas inscrições de forma direta e efetuem o pagamento de maneira segura e integrada com a API do Mercado Pago. Esse modelo confirma a inscrição na hora da efetuação do pagamento.
*   **Galeria de Fotos do Evento:** Uma seção dedicada à galeria de fotos permite que os atletas visualizem e acessem as imagens capturadas pelos fotógrafos durante o torneio ocm os melhores momentos.
*   **Informações de Localização:** Detalhes sobre o local de realização do torneio são disponibilizados, facilitando o planejamento e a chegada dos participantes.
*   **Dados Completos do Torneio:** Todas as informações essenciais sobre o torneio, incluindo datas, horários e regras são apresentados.
*   **Seção de Patrocinadores:** Uma área exclusiva é dedicada aos patrocinadores do evento, destacando as empresas e marcas que apoiam o Brothers Cup.
*   **Canais de Contato:** Para dúvidas ou suporte, os usuários podem acessar facilmente as informações de contato da organização do torneio.

### Para Administradores

O painel administrativo do Brothers Cup oferece ferramentas para a gestão do torneio:

*   **Gestão de Inscrições:** Os administradores possuem uma visão completa de todas as inscrições realizadas. Cada registro inclui informações cruciais para o gerenciamento, conforme detalhado na tabela abaixo:

| Campo                  | Descrição                                                              |
| :--------------------- | :--------------------------------------------------------------------- |
| **Nome do Atleta**     | Nome completo do participante.                                         |
| **Usuário do Instagram** | Identificador do atleta na plataforma Instagram.                        |
| **Número de Celular**  | Contato telefônico do atleta.                                           |
| **Tamanho do Uniforme**| Tamanho do uniforme solicitado pelo atleta.                             |
| **Categoria**          | Categoria em que o atleta está inscrito (e.g., Masculino, Feminino, Misto). |
| **Data da Inscrição**  | Data e hora em que a inscrição foi efetuada.                            |
| **Situação da Inscrição**| Status do pagamento da inscrição (Paga, Pendente, Metade Paga, Recusada). |

*   **Administração Dinâmica de Vagas por Categoria:** O sistema permite um controle flexível sobre o número de vagas disponíveis para cada categoria. Os administradores podem acompanhar em tempo real o preenchimento das vagas e ajustar o limite, aumentando-o em caso de alta demanda ou reduzindo-o conforme a necessidade.

## Tecnologias Utilizadas

O desenvolvimento do Brothers Cup foi realizado com as seguintes tecnologias:

*   **Frontend:** A interface do usuário foi construída utilizando **React** e **JavaScript**.
*   **Backend:** O servidor foi integrado com a API do Mercado Pago e implementado com **Node.js** e **JavaScript**.
*   **Banco de Dados:** Para o armazenamento e gerenciamento de dados, foi utilizado o **PostgreSQL**.

## Arquitetura e Deploy

A arquitetura do projeto foi distribuída, com o frontend e o backend hospedados em ambientes distintos:

*   **Frontend:** O deploy do frontend foi realizado na **Vercel**, utilizando um domínio próprio para acesso público.
*   **Backend:** O backend está hospedado em uma **VPS da Hostinger**, configurado para se comunicar com o frontend.

## Contato

Para entrar em contato, utilize o e-mail: ryan@calmon.net.br

