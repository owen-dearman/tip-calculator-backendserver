DROP TABLE IF EXISTS saved_settings;

create table saved_settings (
    id serial primary key not null,
    name varchar(255) not null,
    currency varchar(1),
    numPayee integer not null,
    discountType varchar(255) not null,
    tipType varchar(255) not null,
    discount integer not null,
    tip integer not null,
    misc integer,
    roundUp boolean not null
)

insert into saved_settings (name, currency, numPayee, discountType, tipType, discount, tip, misc, roundUp) values
('American 10%', '$', 1, 'percentage', 'percentage', 0, 10, 0, 'false'),
('25% discount, 2 paying', '£', 2, 'percentage', 'percentage', 25, 0, 0, 'false'),
('group of 5', '£', 5, 'percentage', 'setAmount', 0, 15, 0, 'false')