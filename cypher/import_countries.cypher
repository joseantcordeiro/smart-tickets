LOAD CSV WITH HEADERS FROM 'file:///countries.csv' AS row
MERGE (c:Country {iso_2: row.iso_2, iso_3: row.iso_3, num_code: row.num_code, name: row.name, display_name: row.display_name})
RETURN *

LOAD CSV FROM "/countries.csv" WITH HEADER AS row
CREATE (c:Country {iso_2: row.iso_2, iso_3: row.iso_3, num_code: row.num_code, name: row.name, display_name: row.display_name});
