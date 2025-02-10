CREATE TABLE Breeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    picture_path TEXT
);

CREATE TABLE Dogs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT NOT NULL,
    birthday DATE,
    shelved BOOLEAN,
    notes TEXT,
    picture_path TEXT,
    default_pack_price REAL,
    breed_id INTEGER NOT NULL,
    FOREIGN KEY (breed_id) REFERENCES Breeds(id)
);

CREATE TABLE Owners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone_numbers TEXT,
    email TEXT,
    adresses TEXT,
    about TEXT,
    register_date DATE
);

CREATE TABLE Dogs_Owners (
    dog_id TEXT,
    owner_id TEXT,
    PRIMARY KEY (dog_id, owner_id)
);

CREATE TABLE Service (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon TEXT,
    name TEXT,
    base_price REAL
);

CREATE TABLE PackageModel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    base_price REAL
);

CREATE TABLE PackageModel_Service (
    package_model_id INTEGER,
    service_id INTEGER,
    frequency TEXT CHECK(frequency IN ('monthly', 'weekly')),
    amount INTEGER,
    PRIMARY KEY (package_model_id, service_id)
);

CREATE TABLE Payment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value REAL,
    type TEXT CHECK(type IN ('cash', 'pix', 'credit', 'debit')),
    date DATE
);

CREATE TABLE Package (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT CHECK(Status IN ('in-progress', 'completed')),
    model_id INTEGER NOT NULL,
    dog_id TEXT NOT NULL,
    payment_id INTEGER UNIQUE,
    FOREIGN KEY (model_id) REFERENCES PackageModel(id),
    FOREIGN KEY (dog_id) REFERENCES Dogs(id),
    FOREIGN KEY (payment_id) REFERENCES Payment(id)
);

CREATE TABLE Scheduling (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    time TEXT,
    status TEXT CHECK(status IN ('cancelled', 'lost', 'todate', 'fulfilled')),
    observations TEXT,
    package_id INTEGER,
    dog_id TEXT,
    payment_id INTEGER UNIQUE,
    FOREIGN KEY (package_id) REFERENCES Package(id),
    FOREIGN KEY (dog_id) REFERENCES Dogs(id),
    FOREIGN KEY (payment_id) REFERENCES Payment(id)
);

CREATE TABLE Service_Scheduling (
    service_id INTEGER,
    scheduling_id INTEGER,
    price REAL,
    PRIMARY KEY (service_id, scheduling_id)
);

INSERT INTO Breeds (name, description) VALUES
(
'Bulldog', 
'O Bulldog é um cão de corpo robusto e musculoso, com pele enrugada e focinho achatado. 
Possui uma mordida prognata, o que lhe confere uma expressão característica. 
Eles têm altura entre 31 a 40 cm e pesam de 18 a 25 kg.'
), (
'Cocker',
'O Cocker é conhecido por suas orelhas longas e caídas, olhos grandes e expressivos, 
além de seu pelo longo e ondulado. Eles medem de 36 a 41 cm de altura e pesam de 13 a 16 kg.'
), (
'Collie',
'O Collie é um cão de pelagem longa e densa, rosto alongado com olhos expressivos e uma crina que lembra 
a de um leão. Sua altura varia de 51 a 61 cm e seu peso de 23 a 34 kg.'
), (
'Lhasa Apso',
'O Lhasa Apso é pequeno, mas robusto, com pelagem longa e reta. Possui barba e bigodes característicos. 
Mede de 25 a 28 cm de altura e pesa de 5 a 8 kg.'
), (
'Lulu da Pomerânia',
'O Lulu da Pomerânia é um cão pequeno, mas cheio de energia. Possui pelagem densa e volumosa, e aparência 
de raposa com olhos brilhantes. Sua altura varia de 18 a 24 cm e pesa de 1,5 a 3 kg.'
), (
'Maltês',
'O Maltês é pequeno com pelo longo e branco, apresentando uma expressão doce. Mede de 20 a 
25 cm de altura e pesa de 3 a 4 kg.'
), (
'Pitbull',
'O Pitbull é um cão musculoso, com pelagem curta e cabeça larga. Seus olhos são expressivos e o 
focinho é forte. Eles medem de 45 a 55 cm de altura e pesam de 14 a 27 kg.'
), (
'Pinscher',
'O Pinscher é pequeno e esguio, com pelagem curta e brilhante, e orelhas eretas. 
Sua altura varia de 25 a 30 cm e pesa de 4 a 5 kg.'
), (
'Poodle',
'O Pinscher é pequeno e esguio, com pelagem curta e brilhante. Possui orelhas eretas e cauda 
geralmente cortada. Sua altura varia de 25 a 30 cm e pesa de 4 a 5 kg.'
), (
'Pug',
'O Pug é um cão compacto, com focinho achatado e enrugado. Seus olhos são grandes e redondos. 
Eles medem de 25 a 30 cm de altura e pesam de 6 a 8 kg.'
), (
'Shih-tzu',
'O Shih-tzu é pequeno, com pelagem longa e sedosa. Sua cabeça é arredondada, com barba e bigodes. 
Mede de 20 a 28 cm de altura e pesa de 4 a 7 kg.'
), (
'Vira-lata (SRD)',
'Os vira-latas (sem raças definidas) são cães de aparência variada, pois não seguem um padrão específico. 
Eles geralmente possuem uma combinação de características de várias raças e podem variar de pequeno a grande porte.'
), (
'Yorkshire Terrier', 
'O Yorkshire Terrier é pequeno, com pelagem longa e sedosa, geralmente de coloração azul-aço e dourado. 
Mede de 18 a 23 cm de altura e pesa de 2 a 3 kg.'
);
