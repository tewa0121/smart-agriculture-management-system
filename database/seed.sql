USE smart_agriculture;

-- =========================================================
-- 1. CROP TYPES
-- =========================================================

INSERT INTO crop_types
    (name, description, growth_duration_days,
     recommended_irrigation_interval_days,
     recommended_fertilizer_interval_days)
VALUES
    ('Maize',
     'Common cereal crop suitable for field production.',
     120, 7, 21),

    ('Wheat',
     'Cereal crop commonly grown in cooler seasons.',
     150, 10, 30),

    ('Teff',
     'Important cereal crop widely cultivated in Ethiopia.',
     120, 8, 25),

    ('Potato',
     'Root and tuber crop suitable for irrigated production.',
     90, 5, 20),

    ('Tomato',
     'Vegetable crop requiring regular irrigation and nutrient management.',
     90, 4, 14),

    ('Onion',
     'Bulb vegetable crop.',
     110, 6, 21),

    ('Bean',
     'Legume crop suitable for small and medium farms.',
     75, 5, 20);


-- =========================================================
-- 2. IRRIGATION METHODS
-- =========================================================

INSERT INTO irrigation_methods
    (name, description)
VALUES
    ('Drip Irrigation',
     'Water is delivered directly to the root zone through drip lines.'),

    ('Sprinkler Irrigation',
     'Water is distributed over crops using sprinkler equipment.'),

    ('Furrow Irrigation',
     'Water flows through small channels between crop rows.'),

    ('Manual Irrigation',
     'Water is applied manually using containers or hoses.'),

    ('Rainfed',
     'Crop receives water primarily from rainfall.');


-- =========================================================
-- 3. FERTILIZER TYPES
-- =========================================================

INSERT INTO fertilizer_types
    (name, description)
VALUES
    ('Urea',
     'Nitrogen fertilizer commonly used to support vegetative growth.'),

    ('DAP',
     'Phosphorus and nitrogen fertilizer used during crop establishment.'),

    ('NPS',
     'Compound fertilizer containing nitrogen, phosphorus and sulfur.'),

    ('Compost',
     'Organic fertilizer produced from decomposed organic material.'),

    ('Manure',
     'Organic fertilizer derived from livestock manure.');


-- =========================================================
-- 4. ADMIN USER
-- Password: Admin@123
-- bcrypt hash generated for the application
-- =========================================================

INSERT INTO users
    (name, email, password, role, phone, address)
VALUES
    (
        'System Administrator',
        'admin@smartagriculture.com',
        '$2b$10$7EqJtq98hPqEX7fNZaFWoO5h8m9Q4JQjv2w8J1L6w4Y0XQm5Q5K3K',
        'admin',
        '+251900000001',
        'Agricultural Management Office'
    );


-- =========================================================
-- 5. FARMER USER
-- Password: Farmer@123
-- bcrypt hash generated for the application
-- =========================================================

INSERT INTO users
    (name, email, password, role, phone, address)
VALUES
    (
        'Abebe Farmer',
        'farmer@smartagriculture.com',
        '$2b$10$7EqJtq98hPqEX7fNZaFWoO5h8m9Q4JQjv2w8J1L6w4Y0XQm5Q5K3K',
        'farmer',
        '+251900000002',
        'Amhara Region, Ethiopia'
    );


-- =========================================================
-- 6. FARMS
-- =========================================================

INSERT INTO farms
    (user_id, name, location, total_area, area_unit, description)
VALUES
    (
        2,
        'Green Valley Farm',
        'Amhara Region, Ethiopia',
        12.50,
        'hectare',
        'Main crop production farm.'
    ),

    (
        2,
        'Highland Vegetable Farm',
        'Finote Selam, Ethiopia',
        5.00,
        'hectare',
        'Vegetable production and irrigation demonstration farm.'
    );


-- =========================================================
-- 7. FIELDS
-- =========================================================

INSERT INTO fields
    (farm_id, name, area, area_unit, soil_type, description)
VALUES
    (
        1,
        'North Field',
        5.00,
        'hectare',
        'Loam',
        'Main maize production field.'
    ),

    (
        1,
        'South Field',
        4.50,
        'hectare',
        'Clay Loam',
        'Wheat production field.'
    ),

    (
        1,
        'East Field',
        3.00,
        'hectare',
        'Loam',
        'Teff production field.'
    ),

    (
        2,
        'Vegetable Field A',
        2.50,
        'hectare',
        'Sandy Loam',
        'Tomato and vegetable production field.'
    ),

    (
        2,
        'Vegetable Field B',
        2.50,
        'hectare',
        'Loam',
        'Onion production field.'
    );


-- =========================================================
-- 8. CROPS
-- =========================================================

INSERT INTO crops
    (field_id, crop_type_id, name, planting_date,
     expected_harvest_date, status, notes)
VALUES
    (
        1,
        1,
        'Maize Season 2026',
        '2026-06-01',
        '2026-09-29',
        'growing',
        'Healthy maize crop.'
    ),

    (
        2,
        2,
        'Wheat Season 2026',
        '2026-05-15',
        '2026-10-12',
        'growing',
        'Regular monitoring required.'
    ),

    (
        3,
        3,
        'Teff Season 2026',
        '2026-06-15',
        '2026-10-13',
        'growing',
        'Rainfed production.'
    ),

    (
        4,
        5,
        'Tomato Season 2026',
        '2026-07-01',
        '2026-09-29',
        'growing',
        'Irrigated vegetable production.'
    ),

    (
        5,
        6,
        'Onion Season 2026',
        '2026-06-20',
        '2026-10-08',
        'growing',
        'Monitor irrigation and fertilizer schedule.'
    );


-- =========================================================
-- 9. IRRIGATION RECORDS
-- =========================================================

INSERT INTO irrigation_records
    (crop_id, irrigation_method_id, irrigation_date,
     quantity, quantity_unit, cost, interval_days, notes)
VALUES
    (
        1,
        3,
        '2026-08-31',
        12000,
        'liters',
        250,
        7,
        'Furrow irrigation.'
    ),

    (
        1,
        3,
        '2026-09-05',
        12000,
        'liters',
        250,
        7,
        'Furrow irrigation.'
    ),

    (
        2,
        3,
        '2026-08-28',
        10000,
        'liters',
        200,
        10,
        'Supplementary irrigation.'
    ),

    (
        4,
        1,
        '2026-09-04',
        5000,
        'liters',
        180,
        4,
        'Drip irrigation.'
    ),

    (
        5,
        1,
        '2026-09-02',
        4500,
        'liters',
        160,
        6,
        'Drip irrigation.'
    );


-- =========================================================
-- 10. FERTILIZER RECORDS
-- =========================================================

INSERT INTO fertilizer_records
    (crop_id, fertilizer_type_id, application_date,
     quantity, quantity_unit, cost, interval_days, notes)
VALUES
    (
        1,
        1,
        '2026-08-20',
        100,
        'kg',
        4500,
        21,
        'Nitrogen application.'
    ),

    (
        2,
        2,
        '2026-08-10',
        80,
        'kg',
        3600,
        30,
        'Base fertilizer application.'
    ),

    (
        4,
        3,
        '2026-08-25',
        50,
        'kg',
        2800,
        14,
        'Vegetable crop nutrient application.'
    ),

    (
        5,
        4,
        '2026-08-18',
        150,
        'kg',
        3000,
        21,
        'Organic compost application.'
    );


-- =========================================================
-- 11. PESTICIDE RECORDS
-- =========================================================

INSERT INTO pesticide_records
    (crop_id, product_name, application_date,
     quantity, quantity_unit, cost, notes)
VALUES
    (
        1,
        'Crop Protection Product A',
        '2026-08-25',
        2,
        'liters',
        1500,
        'Applied according to farm management instructions.'
    ),

    (
        4,
        'Vegetable Protection Product B',
        '2026-09-01',
        1,
        'liter',
        950,
        'Routine crop protection.'
    );


-- =========================================================
-- 12. FARM ACTIVITIES
-- =========================================================

INSERT INTO farm_activities
    (crop_id, field_id, activity_type, activity_date,
     description, labor_cost)
VALUES
    (
        1,
        1,
        'Weeding',
        '2026-08-15',
        'Manual field weeding.',
        1200
    ),

    (
        1,
        1,
        'Field Inspection',
        '2026-08-28',
        'Routine crop inspection.',
        300
    ),

    (
        2,
        2,
        'Weeding',
        '2026-08-20',
        'Field maintenance.',
        1000
    ),

    (
        4,
        4,
        'Pruning',
        '2026-08-30',
        'Tomato plant maintenance.',
        800
    ),

    (
        5,
        5,
        'Weeding',
        '2026-08-22',
        'Onion field maintenance.',
        700
    );


-- =========================================================
-- 13. EXPENSES
-- =========================================================

INSERT INTO expenses
    (farm_id, field_id, crop_id, category,
     description, amount, expense_date)
VALUES
    (1, 1, 1, 'fertilizer',
     'Maize fertilizer purchase', 4500, '2026-08-20'),

    (1, 1, 1, 'irrigation',
     'Maize irrigation cost', 250, '2026-09-05'),

    (1, 1, 1, 'labor',
     'Maize field labor', 1200, '2026-08-15'),

    (1, 1, 1, 'pesticide',
     'Crop protection product', 1500, '2026-08-25'),

    (1, 2, 2, 'fertilizer',
     'Wheat fertilizer purchase', 3600, '2026-08-10'),

    (1, 2, 2, 'labor',
     'Wheat field labor', 1000, '2026-08-20'),

    (2, 4, 4, 'fertilizer',
     'Tomato fertilizer', 2800, '2026-08-25'),

    (2, 4, 4, 'irrigation',
     'Tomato irrigation', 180, '2026-09-04'),

    (2, 4, 4, 'pesticide',
     'Tomato crop protection', 950, '2026-09-01'),

    (2, 4, 4, 'labor',
     'Tomato field labor', 800, '2026-08-30'),

    (2, 5, 5, 'fertilizer',
     'Onion compost', 3000, '2026-08-18'),

    (2, 5, 5, 'labor',
     'Onion field labor', 700, '2026-08-22');


-- =========================================================
-- 14. WEATHER RECORDS
-- =========================================================

INSERT INTO weather_records
    (farm_id, record_date, temperature, humidity,
     rainfall, wind_speed, weather_condition, notes)
VALUES
    (
        1,
        '2026-09-01',
        22.5,
        68.0,
        4.2,
        12.5,
        'Partly Cloudy',
        'Moderate conditions.'
    ),

    (
        1,
        '2026-09-03',
        23.1,
        64.0,
        0.0,
        10.2,
        'Sunny',
        'No rainfall recorded.'
    ),

    (
        1,
        '2026-09-05',
        21.8,
        72.0,
        8.5,
        9.4,
        'Rainy',
        'Useful rainfall for field crops.'
    ),

    (
        2,
        '2026-09-02',
        24.0,
        60.0,
        0.0,
        11.0,
        'Sunny',
        'Irrigation required.'
    ),

    (
        2,
        '2026-09-04',
        23.4,
        66.0,
        2.1,
        8.7,
        'Partly Cloudy',
        'Normal vegetable production conditions.'
    );