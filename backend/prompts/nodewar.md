Agora, eu preciso do seguinte:

Ao invés de ter vários botões para o membro se atribuir a role, eu quero na verdade somente um botão chamado "Participar" sem emojis.

E nós criaremos a lógica de qual role esse membro fará parte.

Para isso, vou te explicar como irá funcionar a partir de agora:

No servidor, teremos vários cargos e dentro destes cargos, podemos ter um ou mais membros. Um membro pode estar em mais de um cargo também.

A regra para determinar qual função o membro fará parte na nodewar é a seguinte será como uma escadinha, ou seja, sempre que uma role exceder o numero de membros, validaremos a proxima role, até não sobrarem mais roles nem vagas, passando o membro para a fila de espera, conforme abaixo:

- Membro tem o cargo CALLER -> se não estiver nenhum caller associado a batalha, ele será o caller da batalha
- Membro tem o cargo de FLAME -> se não atingiu o limite de membros de FLAME, ele será o FLAME da batalha
- Membro tem o cargo de HWACHA -> se não atingiu o limite de membros de HWACHA, ele será o HWACHA da batalha
- Membro tem o cargo de ELEFANTE -> se não atingiu o limite de membros de ELEFANTE, ele será o ELEFANTE da batalha
- Membro tem o cargo de BANDEIRA -> se não atingiu o limite de membros de BANDEIRA, ele será a BANDEIRA da batalha
- Membro tem o cargo de BOMBER -> se não atingiu o limite de membros de BOMBER, ele será o BOMBER da batalha
- Membro tem o cargo de SHAI -> se não atingiu o limite de membros de SHAI, ele será o SHAI da batalha
- Membro tem os cargos de (RANGED e ARQUEIRO) ou (RANGED e CAÇADORA) -> se não atingiu o limite de membros de RANGED, ele será o RANGED da batalha
- Membro tem o cargo de FRONTLINE ou qualquer outro cargo -> se não atingiu o limite de membros de FRONTLINE, ele será o FRONTLINE da batalha
- Caso tenha atingido o limite de membros nas outras roles, será adicionado na fila de espera

Regras de codificação:
- Faça um código limpo, bem quebradinho, sem extrapolar o número maximo de linhas
- Use boas práticas de programação como SOLID, Clean Code, DRY
- Evite o uso de for let i, prefira a API de Arrays
