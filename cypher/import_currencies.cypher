LOAD CSV WITH HEADERS FROM 'file:///currencies.csv' AS row
MERGE (c:Currency {code: row.code, symbol: row.symbol, symbol_native: row.symbol_native, name: row.name})
RETURN *