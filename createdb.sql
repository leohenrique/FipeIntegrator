

-- TypeVehicle: 0-Car, 1-Motocycle, 2-Truck
create table Brand (id integer not null, name varchar(50) not null, idFipe integer, typeVehicle integer not null,
                    primary key(id));

create table Model (id integer not null, name varchar(50) not null, idBrand integer not null,  idFipe integer
                    primary key(id),
                    foreign key(idBrand) references Brand (id));
