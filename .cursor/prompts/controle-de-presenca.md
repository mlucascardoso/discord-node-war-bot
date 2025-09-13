Ao conversar com meu colega, ele me pediu algumas alterações no nosso sistema, vou começar falando a respeito do controle de presença:

1. Precisamos simplificar o cadastro, não é necessário informar a sessão da nodewar, nem status de participação
2. Na tela de cadastro de participação, deve ser possível fazer o upload de imagens (mais de uma) para reconhecimento dos nomes dos membros da guilda que participaram da nodewar naquele dia. Eles farão esse cadastro diariamente, então é importante somente que a gente tenha uma data de registro para computar para aquela semana.
3. A listagem de participações (tabela) não é mais necessária, somente aquela visão por membros com as 3 colunas "completo", "parcial" e "não participou"
4. Os filtros podem ser removidos também.

Siga as regras @dev.mdc 


----------

Questões para Esclarecimento:
Reconhecimento de Imagens: Será implementado processamento automático ou manual?
R: Vamos utilizar alguma biblioteca para ler essas imagens e extrair os nomes para realizar o cadastro do dia.
Armazenamento: Imagens no servidor local, cloud storage ou base64?
R: nao precisa armazenar a imagem, após reconhecer os nomes, pode descarta-la.
Data de Registro: Usar data atual ou permitir seleção de data específica?
R: Use a data atual no horário de brasilia
Validação: Como garantir que os nomes reconhecidos correspondem aos membros cadastrados?
R: Nós iremos cadastrar os nomes EXATAMENTE iguais aos q vamos te mandar nas imagens