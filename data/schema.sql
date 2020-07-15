DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS test; 
CREATE TABLE test(
    fname VARCHAR(255),
    lname VARCHAR(255)
);


CREATE TABLE locations(
 id  SERIAL PRIMARY KEY,
 search_query VARCHAR(255),
 formatted_query VARCHAR(255),
 latitude NUMERIC(10,7),
 lnogitude NUMERIC(10,7)
);