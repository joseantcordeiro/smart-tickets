LOAD CSV WITH HEADERS FROM 'file:///language-codes-3b2_csv.csv' AS row
MERGE (c:Language {alpha_2: row.alpha2, name: row.English})
RETURN *

LOAD CSV FROM "/language.csv" WITH HEADER AS row
CREATE (l:Language {alpha_2: row.alpha2, name: row.English});
