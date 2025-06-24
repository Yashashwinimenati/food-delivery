-- Seed Data for Food Delivery Platform
-- This file contains sample data for testing the application

-- Insert sample users (password: password123)
INSERT INTO users (name, email, password_hash, phone) VALUES
('John Doe', 'john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+91-9876543210'),
('Jane Smith', 'jane@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+91-9876543211'),
('Mike Johnson', 'mike@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+91-9876543212'),
('Sarah Wilson', 'sarah@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+91-9876543213'),
('David Brown', 'david@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+91-9876543214');

-- Insert sample addresses
INSERT INTO addresses (user_id, type, address_line1, address_line2, city, state, pincode, latitude, longitude, is_default) VALUES
(1, 'home', '123 Main Street', 'Apt 4B', 'Mumbai', 'Maharashtra', '400001', 19.0760, 72.8777, TRUE),
(1, 'work', '456 Business Park', 'Floor 8', 'Mumbai', 'Maharashtra', '400002', 19.0170, 72.8478, FALSE),
(2, 'home', '789 Oak Avenue', 'House 12', 'Mumbai', 'Maharashtra', '400003', 19.0596, 72.8295, TRUE),
(3, 'home', '321 Pine Road', 'Flat 7C', 'Mumbai', 'Maharashtra', '400004', 19.1136, 72.8697, TRUE),
(4, 'home', '654 Elm Street', 'Villa 3', 'Mumbai', 'Maharashtra', '400005', 19.0759, 72.8774, TRUE),
(5, 'home', '987 Maple Drive', 'Apartment 15', 'Mumbai', 'Maharashtra', '400006', 19.0760, 72.8777, TRUE);

-- Insert sample restaurants
INSERT INTO restaurants (name, description, cuisine_types, address_line1, address_line2, city, state, pincode, latitude, longitude, phone, email, opening_time, closing_time, min_order_amount, delivery_fee, avg_preparation_time, rating, total_reviews, is_open, is_veg_only, image_url) VALUES
('Pizza Paradise', 'Best pizzas in town with authentic Italian recipes', '["Italian", "Fast Food"]', '123 Food Street', 'Near Central Mall', 'Mumbai', 'Maharashtra', '400001', 19.0760, 72.8777, '+91-9876543201', 'pizza@paradise.com', '11:00', '23:00', 200, 40, 25, 4.2, 1250, TRUE, FALSE, 'https://images.unsplash.com/photo-1513104890138-7c749659a591'),
('Burger House', 'Juicy burgers and crispy fries', '["American", "Fast Food"]', '456 Burger Lane', 'Opposite Park', 'Mumbai', 'Maharashtra', '400002', 19.0170, 72.8478, '+91-9876543202', 'burger@house.com', '10:00', '22:00', 150, 30, 20, 4.0, 890, TRUE, FALSE, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'),
('Spice Garden', 'Authentic Indian cuisine with traditional spices', '["Indian", "North Indian"]', '789 Spice Road', 'Near Temple', 'Mumbai', 'Maharashtra', '400003', 19.0596, 72.8295, '+91-9876543203', 'spice@garden.com', '12:00', '23:30', 300, 50, 35, 4.5, 2100, TRUE, FALSE, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1'),
('Sushi Master', 'Fresh sushi and Japanese delicacies', '["Japanese", "Asian"]', '321 Sushi Street', 'Near Harbor', 'Mumbai', 'Maharashtra', '400004', 19.1136, 72.8697, '+91-9876543204', 'sushi@master.com', '11:30', '22:30', 400, 60, 30, 4.3, 750, TRUE, FALSE, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351'),
('Green Leaf', 'Pure vegetarian restaurant with healthy options', '["Indian", "Vegetarian"]', '654 Green Avenue', 'Near Garden', 'Mumbai', 'Maharashtra', '400005', 19.0759, 72.8774, '+91-9876543205', 'green@leaf.com', '10:30', '22:00', 250, 40, 25, 4.1, 980, TRUE, TRUE, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'),
('Taco Fiesta', 'Mexican street food and tacos', '["Mexican", "Street Food"]', '987 Taco Road', 'Near Beach', 'Mumbai', 'Maharashtra', '400006', 19.0760, 72.8777, '+91-9876543206', 'taco@fiesta.com', '11:00', '23:00', 180, 35, 20, 3.9, 650, TRUE, FALSE, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47'),
('Noodle House', 'Chinese and Asian noodle dishes', '["Chinese", "Asian"]', '147 Noodle Lane', 'Near Market', 'Mumbai', 'Maharashtra', '400007', 19.0170, 72.8478, '+91-9876543207', 'noodle@house.com', '11:30', '22:30', 220, 45, 28, 4.0, 820, TRUE, FALSE, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624'),
('Dessert Corner', 'Sweet treats and desserts', '["Desserts", "Bakery"]', '258 Sweet Street', 'Near School', 'Mumbai', 'Maharashtra', '400008', 19.0596, 72.8295, '+91-9876543208', 'dessert@corner.com', '09:00', '21:00', 100, 25, 15, 4.4, 1100, TRUE, TRUE, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187'),
('Coffee Brew', 'Premium coffee and light snacks', '["Coffee", "Cafe"]', '369 Coffee Road', 'Near Office', 'Mumbai', 'Maharashtra', '400009', 19.1136, 72.8697, '+91-9876543209', 'coffee@brew.com', '07:00', '22:00', 120, 30, 10, 4.2, 950, TRUE, TRUE, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93'),
('Seafood Delight', 'Fresh seafood and coastal cuisine', '["Seafood", "Coastal"]', '741 Fish Lane', 'Near Port', 'Mumbai', 'Maharashtra', '400010', 19.0759, 72.8774, '+91-9876543210', 'seafood@delight.com', '12:00', '23:00', 350, 55, 40, 4.3, 680, TRUE, FALSE, 'https://images.unsplash.com/photo-1559847844-5315695dadae'),
('Pasta Palace', 'Italian pasta and Mediterranean dishes', '["Italian", "Mediterranean"]', '852 Pasta Street', 'Near Mall', 'Mumbai', 'Maharashtra', '400011', 19.0760, 72.8777, '+91-9876543211', 'pasta@palace.com', '11:00', '22:30', 280, 45, 30, 4.1, 720, TRUE, FALSE, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5'),
('Kebab House', 'Middle Eastern kebabs and grills', '["Middle Eastern", "Grill"]', '963 Kebab Road', 'Near Mosque', 'Mumbai', 'Maharashtra', '400012', 19.0170, 72.8478, '+91-9876543212', 'kebab@house.com', '12:00', '23:30', 320, 50, 35, 4.0, 580, TRUE, FALSE, 'https://images.unsplash.com/photo-1559847844-5315695dadae'),
('Ice Cream World', 'Artisanal ice creams and frozen treats', '["Desserts", "Ice Cream"]', '159 Ice Street', 'Near Park', 'Mumbai', 'Maharashtra', '400013', 19.0596, 72.8295, '+91-9876543213', 'ice@cream.com', '10:00', '22:00', 80, 20, 8, 4.5, 1300, TRUE, TRUE, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb'),
('Sandwich Shop', 'Fresh sandwiches and wraps', '["Fast Food", "Sandwiches"]', '357 Sandwich Lane', 'Near Hospital', 'Mumbai', 'Maharashtra', '400014', 19.1136, 72.8697, '+91-9876543214', 'sandwich@shop.com', '08:00', '20:00', 150, 30, 15, 3.8, 420, TRUE, FALSE, 'https://images.unsplash.com/photo-1528735602786-485f7326c886'),
('Salad Bar', 'Healthy salads and smoothies', '["Healthy", "Salads"]', '486 Salad Road', 'Near Gym', 'Mumbai', 'Maharashtra', '400015', 19.0759, 72.8774, '+91-9876543215', 'salad@bar.com', '09:00', '21:00', 200, 35, 12, 4.2, 890, TRUE, TRUE, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd'),
('BBQ Grill', 'Barbecue and grilled specialties', '["BBQ", "Grill"]', '753 BBQ Street', 'Near Stadium', 'Mumbai', 'Maharashtra', '400016', 19.0760, 72.8777, '+91-9876543216', 'bbq@grill.com', '17:00', '23:00', 400, 60, 45, 4.1, 650, TRUE, FALSE, 'https://images.unsplash.com/photo-1558030006-450675393462'),
('Thai Spice', 'Authentic Thai cuisine', '["Thai", "Asian"]', '951 Thai Lane', 'Near Temple', 'Mumbai', 'Maharashtra', '400017', 19.0170, 72.8478, '+91-9876543217', 'thai@spice.com', '11:30', '22:30', 350, 55, 35, 4.3, 780, TRUE, FALSE, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'),
('Bakery Fresh', 'Fresh breads and pastries', '["Bakery", "Bread"]', '264 Bakery Road', 'Near Market', 'Mumbai', 'Maharashtra', '400018', 19.0596, 72.8295, '+91-9876543218', 'bakery@fresh.com', '06:00', '20:00', 120, 25, 10, 4.4, 1100, TRUE, TRUE, 'https://images.unsplash.com/photo-1509440159596-0249088772ff'),
('Juice Bar', 'Fresh juices and healthy drinks', '["Juices", "Healthy"]', '573 Juice Street', 'Near School', 'Mumbai', 'Maharashtra', '400019', 19.1136, 72.8697, '+91-9876543219', 'juice@bar.com', '08:00', '21:00', 100, 20, 5, 4.0, 650, TRUE, TRUE, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b'),
('Street Food Hub', 'Local street food favorites', '["Street Food", "Local"]', '864 Street Lane', 'Near Station', 'Mumbai', 'Maharashtra', '400020', 19.0759, 72.8774, '+91-9876543220', 'street@food.com', '10:00', '23:00', 150, 30, 20, 4.1, 920, TRUE, FALSE, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47');

-- Insert menu categories for each restaurant
INSERT INTO menu_categories (restaurant_id, name, description, display_order) VALUES
-- Pizza Paradise
(1, 'Pizzas', 'Fresh baked pizzas with premium toppings', 1),
(1, 'Pasta', 'Italian pasta dishes', 2),
(1, 'Beverages', 'Soft drinks and juices', 3),
(1, 'Desserts', 'Sweet endings', 4),

-- Burger House
(2, 'Burgers', 'Juicy beef and chicken burgers', 1),
(2, 'Sides', 'French fries and onion rings', 2),
(2, 'Beverages', 'Soft drinks and shakes', 3),

-- Spice Garden
(3, 'Starters', 'Appetizers and snacks', 1),
(3, 'Main Course', 'Traditional Indian dishes', 2),
(3, 'Breads', 'Fresh baked breads', 3),
(3, 'Desserts', 'Indian sweets', 4),

-- Sushi Master
(4, 'Sushi Rolls', 'Fresh sushi rolls', 1),
(4, 'Sashimi', 'Fresh raw fish', 2),
(4, 'Ramen', 'Japanese noodle soup', 3),
(4, 'Beverages', 'Green tea and drinks', 4),

-- Green Leaf
(5, 'Starters', 'Vegetarian appetizers', 1),
(5, 'Main Course', 'Vegetarian main dishes', 2),
(5, 'Breads', 'Whole grain breads', 3),
(5, 'Desserts', 'Healthy desserts', 4);

-- Insert menu items for each restaurant
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, is_veg, is_available, preparation_time, calories, allergens) VALUES
-- Pizza Paradise Items
(1, 1, 'Margherita Pizza', 'Classic pizza with mozzarella and basil', 299, TRUE, TRUE, 20, 850, '["dairy", "gluten"]'),
(1, 1, 'Pepperoni Pizza', 'Spicy pepperoni with cheese', 399, FALSE, TRUE, 25, 950, '["dairy", "gluten", "pork"]'),
(1, 1, 'Veggie Supreme', 'Loaded with fresh vegetables', 349, TRUE, TRUE, 22, 800, '["dairy", "gluten"]'),
(1, 1, 'Chicken Tikka Pizza', 'Indian style chicken tikka pizza', 449, FALSE, TRUE, 28, 1000, '["dairy", "gluten", "chicken"]'),
(1, 2, 'Spaghetti Carbonara', 'Creamy pasta with bacon', 249, FALSE, TRUE, 18, 650, '["dairy", "gluten", "pork"]'),
(1, 2, 'Penne Arrabbiata', 'Spicy tomato pasta', 199, TRUE, TRUE, 15, 550, '["gluten"]'),
(1, 3, 'Coca Cola', 'Refreshing soft drink', 60, TRUE, TRUE, 2, 140, '[]'),
(1, 3, 'Orange Juice', 'Fresh orange juice', 80, TRUE, TRUE, 3, 110, '[]'),
(1, 4, 'Tiramisu', 'Italian coffee dessert', 120, TRUE, TRUE, 5, 300, '["dairy", "gluten", "eggs"]'),

-- Burger House Items
(2, 5, 'Classic Beef Burger', 'Juicy beef patty with lettuce and tomato', 199, FALSE, TRUE, 15, 650, '["beef", "gluten", "dairy"]'),
(2, 5, 'Chicken Burger', 'Grilled chicken with special sauce', 179, FALSE, TRUE, 12, 550, '["chicken", "gluten", "dairy"]'),
(2, 5, 'Veggie Burger', 'Plant-based patty with vegetables', 159, TRUE, TRUE, 10, 450, '["gluten", "dairy"]'),
(2, 5, 'Double Cheese Burger', 'Double patty with extra cheese', 299, FALSE, TRUE, 18, 850, '["beef", "gluten", "dairy"]'),
(2, 6, 'French Fries', 'Crispy golden fries', 89, TRUE, TRUE, 8, 350, '["gluten"]'),
(2, 6, 'Onion Rings', 'Crispy onion rings', 99, TRUE, TRUE, 10, 400, '["gluten", "dairy"]'),
(2, 7, 'Chocolate Shake', 'Rich chocolate milkshake', 120, TRUE, TRUE, 5, 450, '["dairy"]'),
(2, 7, 'Vanilla Shake', 'Smooth vanilla milkshake', 110, TRUE, TRUE, 5, 420, '["dairy"]'),

-- Spice Garden Items
(3, 8, 'Paneer Tikka', 'Grilled cottage cheese with spices', 180, TRUE, TRUE, 15, 280, '["dairy"]'),
(3, 8, 'Chicken Tikka', 'Grilled chicken with Indian spices', 220, FALSE, TRUE, 18, 320, '["chicken"]'),
(3, 8, 'Veg Spring Rolls', 'Crispy vegetable spring rolls', 120, TRUE, TRUE, 12, 200, '["gluten"]'),
(3, 9, 'Butter Chicken', 'Creamy tomato-based chicken curry', 280, FALSE, TRUE, 25, 450, '["dairy", "chicken"]'),
(3, 9, 'Paneer Butter Masala', 'Cottage cheese in rich gravy', 240, TRUE, TRUE, 20, 380, '["dairy"]'),
(3, 9, 'Dal Makhani', 'Creamy black lentils', 160, TRUE, TRUE, 15, 250, '["dairy"]'),
(3, 10, 'Butter Naan', 'Soft butter bread', 30, TRUE, TRUE, 5, 120, '["gluten", "dairy"]'),
(3, 10, 'Roti', 'Whole wheat bread', 20, TRUE, TRUE, 3, 80, '["gluten"]'),
(3, 11, 'Gulab Jamun', 'Sweet milk dumplings', 60, TRUE, TRUE, 5, 200, '["dairy"]'),
(3, 11, 'Rasmalai', 'Soft cottage cheese in milk', 80, TRUE, TRUE, 5, 250, '["dairy"]'),

-- Sushi Master Items
(4, 12, 'California Roll', 'Crab, avocado, and cucumber', 280, FALSE, TRUE, 20, 300, '["seafood", "gluten"]'),
(4, 12, 'Salmon Roll', 'Fresh salmon with rice', 320, FALSE, TRUE, 18, 280, '["seafood", "gluten"]'),
(4, 12, 'Veggie Roll', 'Cucumber, avocado, and carrot', 220, TRUE, TRUE, 15, 200, '["gluten"]'),
(4, 13, 'Salmon Sashimi', 'Fresh salmon slices', 350, FALSE, TRUE, 10, 180, '["seafood"]'),
(4, 13, 'Tuna Sashimi', 'Fresh tuna slices', 380, FALSE, TRUE, 10, 200, '["seafood"]'),
(4, 14, 'Chicken Ramen', 'Noodle soup with chicken', 280, FALSE, TRUE, 25, 450, '["chicken", "gluten"]'),
(4, 14, 'Veg Ramen', 'Vegetable noodle soup', 240, TRUE, TRUE, 20, 380, '["gluten"]'),
(4, 15, 'Green Tea', 'Traditional Japanese green tea', 40, TRUE, TRUE, 2, 0, '[]'),
(4, 15, 'Miso Soup', 'Traditional Japanese soup', 60, TRUE, TRUE, 8, 50, '["soy"]'),

-- Green Leaf Items
(5, 16, 'Veg Spring Rolls', 'Fresh vegetable spring rolls', 120, TRUE, TRUE, 12, 180, '["gluten"]'),
(5, 16, 'Paneer Tikka', 'Grilled cottage cheese', 160, TRUE, TRUE, 15, 250, '["dairy"]'),
(5, 17, 'Palak Paneer', 'Spinach with cottage cheese', 200, TRUE, TRUE, 20, 320, '["dairy"]'),
(5, 17, 'Mixed Vegetable Curry', 'Assorted vegetables in gravy', 180, TRUE, TRUE, 18, 280, '[]'),
(5, 17, 'Dal Fry', 'Spiced yellow lentils', 140, TRUE, TRUE, 15, 220, '[]'),
(5, 18, 'Whole Wheat Roti', 'Healthy whole wheat bread', 25, TRUE, TRUE, 3, 90, '["gluten"]'),
(5, 18, 'Brown Rice', 'Nutritious brown rice', 60, TRUE, TRUE, 10, 150, '[]'),
(5, 19, 'Fruit Salad', 'Fresh seasonal fruits', 80, TRUE, TRUE, 5, 120, '[]'),
(5, 19, 'Yogurt with Honey', 'Healthy dessert option', 60, TRUE, TRUE, 3, 100, '["dairy"]');

-- Insert delivery partners
INSERT INTO delivery_partners (name, phone, email, vehicle_number, vehicle_type, current_latitude, current_longitude, status, rating, total_deliveries) VALUES
('Raj Kumar', '+91-9876543301', 'raj@delivery.com', 'MH01AB1234', 'bike', 19.0760, 72.8777, 'available', 4.5, 1250),
('Amit Singh', '+91-9876543302', 'amit@delivery.com', 'MH01CD5678', 'bike', 19.0170, 72.8478, 'available', 4.3, 980),
('Priya Sharma', '+91-9876543303', 'priya@delivery.com', 'MH01EF9012', 'bike', 19.0596, 72.8295, 'busy', 4.7, 1500),
('Vikram Patel', '+91-9876543304', 'vikram@delivery.com', 'MH01GH3456', 'bike', 19.1136, 72.8697, 'available', 4.2, 850),
('Neha Gupta', '+91-9876543305', 'neha@delivery.com', 'MH01IJ7890', 'bike', 19.0759, 72.8774, 'available', 4.4, 1100),
('Suresh Reddy', '+91-9876543306', 'suresh@delivery.com', 'MH01KL2345', 'bike', 19.0760, 72.8777, 'offline', 4.1, 720),
('Anjali Verma', '+91-9876543307', 'anjali@delivery.com', 'MH01MN6789', 'bike', 19.0170, 72.8478, 'available', 4.6, 1350),
('Rahul Mehta', '+91-9876543308', 'rahul@delivery.com', 'MH01OP0123', 'bike', 19.0596, 72.8295, 'available', 4.0, 680),
('Kavita Joshi', '+91-9876543309', 'kavita@delivery.com', 'MH01QR4567', 'bike', 19.1136, 72.8697, 'busy', 4.3, 920),
('Arun Kumar', '+91-9876543310', 'arun@delivery.com', 'MH01ST8901', 'bike', 19.0759, 72.8774, 'available', 4.5, 1050); 