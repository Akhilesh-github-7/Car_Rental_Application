/**
 * Seed script: Add Kerala cities to Location collection for city-level pickup/drop selection.
 * Run from server root: npm run seed-locations
 * Force re-seed (drops existing): npm run seed-locations:force
 * Requires: MONGO_URI in .env
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Location = require('../models/Location');

const isForce = process.argv.includes('--force');

const KERALA_CITIES = [
  // Thiruvananthapuram
  { city: 'Thiruvananthapuram', title: 'Thiruvananthapuram City', pincode: '695001', district: 'Thiruvananthapuram' },
  { city: 'Neyyattinkara', title: 'Neyyattinkara', pincode: '695121', district: 'Thiruvananthapuram' },
  { city: 'Attingal', title: 'Attingal', pincode: '695101', district: 'Thiruvananthapuram' },
  { city: 'Nedumangad', title: 'Nedumangad', pincode: '695541', district: 'Thiruvananthapuram' },
  { city: 'Varkala', title: 'Varkala', pincode: '695141', district: 'Thiruvananthapuram' },
  { city: 'Kazhakootam', title: 'Kazhakootam', pincode: '695582', district: 'Thiruvananthapuram' },
  { city: 'Kovalam', title: 'Kovalam', pincode: '695527', district: 'Thiruvananthapuram' },
  { city: 'Pozhiyoor', title: 'Pozhiyoor', pincode: '695513', district: 'Thiruvananthapuram' },
  { city: 'Chirayinkeezhu', title: 'Chirayinkeezhu', pincode: '695304', district: 'Thiruvananthapuram' },
  { city: 'Kadakkal', title: 'Kadakkal', pincode: '691536', district: 'Thiruvananthapuram' },
  { city: 'Vamanapuram', title: 'Vamanapuram', pincode: '695606', district: 'Thiruvananthapuram' },
  { city: 'Peringammala', title: 'Peringammala', pincode: '695563', district: 'Thiruvananthapuram' },
  // Kollam
  { city: 'Kollam', title: 'Kollam City', pincode: '691001', district: 'Kollam' },
  { city: 'Karunagapally', title: 'Karunagapally', pincode: '690518', district: 'Kollam' },
  { city: 'Punalur', title: 'Punalur', pincode: '691305', district: 'Kollam' },
  { city: 'Kottarakkara', title: 'Kottarakkara', pincode: '691506', district: 'Kollam' },
  { city: 'Paravur', title: 'Paravur', pincode: '691301', district: 'Kollam' },
  { city: 'Sasthamkotta', title: 'Sasthamkotta', pincode: '690521', district: 'Kollam' },
  { city: 'Anchal', title: 'Anchal', pincode: '691306', district: 'Kollam' },
  { city: 'Chadayamangalam', title: 'Chadayamangalam', pincode: '691534', district: 'Kollam' },
  { city: 'Kundara', title: 'Kundara', pincode: '691501', district: 'Kollam' },
  { city: 'Pathanapuram', title: 'Pathanapuram', pincode: '689695', district: 'Kollam' },
  { city: 'Chavara', title: 'Chavara', pincode: '691583', district: 'Kollam' },
  { city: 'Oachira', title: 'Oachira', pincode: '690526', district: 'Kollam' },
  // Pathanamthitta
  { city: 'Pathanamthitta', title: 'Pathanamthitta Town', pincode: '689645', district: 'Pathanamthitta' },
  { city: 'Adoor', title: 'Adoor', pincode: '691523', district: 'Pathanamthitta' },
  { city: 'Thiruvalla', title: 'Thiruvalla', pincode: '689101', district: 'Pathanamthitta' },
  { city: 'Ranni', title: 'Ranni', pincode: '689673', district: 'Pathanamthitta' },
  { city: 'Kozhencherry', title: 'Kozhencherry', pincode: '689641', district: 'Pathanamthitta' },
  { city: 'Mallappally', title: 'Mallappally', pincode: '689585', district: 'Pathanamthitta' },
  { city: 'Pandalam', title: 'Pandalam', pincode: '689501', district: 'Pathanamthitta' },
  { city: 'Konni', title: 'Konni', pincode: '689691', district: 'Pathanamthitta' },
  { city: 'Aranmula', title: 'Aranmula', pincode: '689533', district: 'Pathanamthitta' },
  { city: 'Kumbanad', title: 'Kumbanad', pincode: '689547', district: 'Pathanamthitta' },
  { city: 'Elanthoor', title: 'Elanthoor', pincode: '689643', district: 'Pathanamthitta' },
  { city: 'Kadapra', title: 'Kadapra', pincode: '689104', district: 'Pathanamthitta' },
  // Alappuzha
  { city: 'Alappuzha', title: 'Alappuzha Town', pincode: '688001', district: 'Alappuzha' },
  { city: 'Cherthala', title: 'Cherthala', pincode: '688524', district: 'Alappuzha' },
  { city: 'Mavelikkara', title: 'Mavelikkara', pincode: '690101', district: 'Alappuzha' },
  { city: 'Kayamkulam', title: 'Kayamkulam', pincode: '690502', district: 'Alappuzha' },
  { city: 'Chengannur', title: 'Chengannur', pincode: '689121', district: 'Alappuzha' },
  { city: 'Haripad', title: 'Haripad', pincode: '690514', district: 'Alappuzha' },
  { city: 'Champakulam', title: 'Champakulam', pincode: '688505', district: 'Alappuzha' },
  { city: 'Ambalappuzha', title: 'Ambalappuzha', pincode: '688561', district: 'Alappuzha' },
  { city: 'Kuttanad', title: 'Kuttanad', pincode: '688502', district: 'Alappuzha' },
  { city: 'Thiruvalla', title: 'Thiruvalla Alappuzha', pincode: '689101', district: 'Alappuzha' },
  { city: 'Pandalam', title: 'Pandalam Alappuzha', pincode: '689501', district: 'Alappuzha' },
  { city: 'Mararikulam', title: 'Mararikulam', pincode: '688523', district: 'Alappuzha' },
  // Kottayam
  { city: 'Kottayam', title: 'Kottayam Town', pincode: '686001', district: 'Kottayam' },
  { city: 'Changanassery', title: 'Changanassery', pincode: '686101', district: 'Kottayam' },
  { city: 'Pala', title: 'Pala', pincode: '686575', district: 'Kottayam' },
  { city: 'Vaikom', title: 'Vaikom', pincode: '686141', district: 'Kottayam' },
  { city: 'Ettumanoor', title: 'Ettumanoor', pincode: '686631', district: 'Kottayam' },
  { city: 'Kanjirapally', title: 'Kanjirapally', pincode: '686507', district: 'Kottayam' },
  { city: 'Kumarakom', title: 'Kumarakom', pincode: '686563', district: 'Kottayam' },
  { city: 'Erattupetta', title: 'Erattupetta', pincode: '686121', district: 'Kottayam' },
  { city: 'Meenachil', title: 'Meenachil', pincode: '686577', district: 'Kottayam' },
  { city: 'Kuravilangad', title: 'Kuravilangad', pincode: '686633', district: 'Kottayam' },
  { city: 'Bharananganam', title: 'Bharananganam', pincode: '686578', district: 'Kottayam' },
  { city: 'Kaduthuruthy', title: 'Kaduthuruthy', pincode: '686604', district: 'Kottayam' },
  // Idukki
  { city: 'Kattappana', title: 'Kattappana', pincode: '685508', district: 'Idukki' },
  { city: 'Thodupuzha', title: 'Thodupuzha', pincode: '685584', district: 'Idukki' },
  { city: 'Munnar', title: 'Munnar', pincode: '685612', district: 'Idukki' },
  { city: 'Adimali', title: 'Adimali', pincode: '685561', district: 'Idukki' },
  { city: 'Nedumkandam', title: 'Nedumkandam', pincode: '685553', district: 'Idukki' },
  { city: 'Painavu', title: 'Painavu', pincode: '685603', district: 'Idukki' },
  { city: 'Vandiperiyar', title: 'Vandiperiyar', pincode: '685533', district: 'Idukki' },
  { city: 'Kumily', title: 'Kumily', pincode: '685509', district: 'Idukki' },
  { city: 'Peerumedu', title: 'Peerumedu', pincode: '685531', district: 'Idukki' },
  { city: 'Udumbanchola', title: 'Udumbanchola', pincode: '685552', district: 'Idukki' },
  { city: 'Devikulam', title: 'Devikulam', pincode: '685613', district: 'Idukki' },
  { city: 'Elappara', title: 'Elappara', pincode: '685501', district: 'Idukki' },
  // Ernakulam
  { city: 'Kochi', title: 'Kochi City', pincode: '682001', district: 'Ernakulam' },
  { city: 'Ernakulam', title: 'Ernakulam Town', pincode: '682011', district: 'Ernakulam' },
  { city: 'Aluva', title: 'Aluva', pincode: '683101', district: 'Ernakulam' },
  { city: 'Kothamangalam', title: 'Kothamangalam', pincode: '686691', district: 'Ernakulam' },
  { city: 'Muvattupuzha', title: 'Muvattupuzha', pincode: '686661', district: 'Ernakulam' },
  { city: 'Perumbavoor', title: 'Perumbavoor', pincode: '683542', district: 'Ernakulam' },
  { city: 'North Paravur', title: 'North Paravur', pincode: '683513', district: 'Ernakulam' },
  { city: 'Kalamassery', title: 'Kalamassery', pincode: '683104', district: 'Ernakulam' },
  { city: 'Thripunithura', title: 'Thripunithura', pincode: '682301', district: 'Ernakulam' },
  { city: 'Maradu', title: 'Maradu', pincode: '682304', district: 'Ernakulam' },
  { city: 'Angamaly', title: 'Angamaly', pincode: '683572', district: 'Ernakulam' },
  { city: 'Piravom', title: 'Piravom', pincode: '686664', district: 'Ernakulam' },
  { city: 'Neriamangalam', title: 'Neriamangalam', pincode: '686693', district: 'Ernakulam' },
  { city: 'Koothattukulam', title: 'Koothattukulam', pincode: '686662', district: 'Ernakulam' },
  // Thrissur
  { city: 'Thrissur', title: 'Thrissur Town', pincode: '680001', district: 'Thrissur' },
  { city: 'Chalakudy', title: 'Chalakudy', pincode: '680307', district: 'Thrissur' },
  { city: 'Irinjalakuda', title: 'Irinjalakuda', pincode: '680121', district: 'Thrissur' },
  { city: 'Guruvayur', title: 'Guruvayur', pincode: '680101', district: 'Thrissur' },
  { city: 'Kodungallur', title: 'Kodungallur', pincode: '680664', district: 'Thrissur' },
  { city: 'Chavakad', title: 'Chavakad', pincode: '680506', district: 'Thrissur' },
  { city: 'Wadakkanchery', title: 'Wadakkanchery', pincode: '680582', district: 'Thrissur' },
  { city: 'Kunnamkulam', title: 'Kunnamkulam', pincode: '680503', district: 'Thrissur' },
  { city: 'Mukundapuram', title: 'Mukundapuram', pincode: '680309', district: 'Thrissur' },
  { city: 'Thalappilly', title: 'Thalappilly', pincode: '680661', district: 'Thrissur' },
  { city: 'Chelakkara', title: 'Chelakkara', pincode: '680586', district: 'Thrissur' },
  { city: 'Pattambi', title: 'Pattambi', pincode: '679306', district: 'Thrissur' },
  // Palakkad
  { city: 'Palakkad', title: 'Palakkad Town', pincode: '678001', district: 'Palakkad' },
  { city: 'Ottapalam', title: 'Ottapalam', pincode: '679101', district: 'Palakkad' },
  { city: 'Chittur', title: 'Chittur', pincode: '678101', district: 'Palakkad' },
  { city: 'Shornur', title: 'Shornur', pincode: '679121', district: 'Palakkad' },
  { city: 'Alathur', title: 'Alathur', pincode: '678541', district: 'Palakkad' },
  { city: 'Mannarkkad', title: 'Mannarkkad', pincode: '678582', district: 'Palakkad' },
  { city: 'Pattambi', title: 'Pattambi Palakkad', pincode: '679306', district: 'Palakkad' },
  { city: 'Kollengode', title: 'Kollengode', pincode: '678506', district: 'Palakkad' },
  { city: 'Nenmara', title: 'Nenmara', pincode: '678508', district: 'Palakkad' },
  { city: 'Chittur-Thathamangalam', title: 'Chittur-Thathamangalam', pincode: '678101', district: 'Palakkad' },
  { city: 'Parli', title: 'Parli', pincode: '678542', district: 'Palakkad' },
  { city: 'Malampuzha', title: 'Malampuzha', pincode: '678651', district: 'Palakkad' },
  // Malappuram
  { city: 'Malappuram', title: 'Malappuram Town', pincode: '676505', district: 'Malappuram' },
  { city: 'Manjeri', title: 'Manjeri', pincode: '676121', district: 'Malappuram' },
  { city: 'Perinthalmanna', title: 'Perinthalmanna', pincode: '679322', district: 'Malappuram' },
  { city: 'Ponnani', title: 'Ponnani', pincode: '679577', district: 'Malappuram' },
  { city: 'Tirur', title: 'Tirur', pincode: '676101', district: 'Malappuram' },
  { city: 'Nilambur', title: 'Nilambur', pincode: '679329', district: 'Malappuram' },
  { city: 'Kottakkal', title: 'Kottakkal', pincode: '676503', district: 'Malappuram' },
  { city: 'Tanur', title: 'Tanur', pincode: '676302', district: 'Malappuram' },
  { city: 'Parappanangadi', title: 'Parappanangadi', pincode: '676303', district: 'Malappuram' },
  { city: 'Valanchery', title: 'Valanchery', pincode: '676552', district: 'Malappuram' },
  { city: 'Kondotty', title: 'Kondotty', pincode: '673638', district: 'Malappuram' },
  { city: 'Wandoor', title: 'Wandoor', pincode: '679328', district: 'Malappuram' },
  // Kozhikode
  { city: 'Kozhikode', title: 'Kozhikode City', pincode: '673001', district: 'Kozhikode' },
  { city: 'Vadakara', title: 'Vadakara', pincode: '673101', district: 'Kozhikode' },
  { city: 'Koyilandy', title: 'Koyilandy', pincode: '673305', district: 'Kozhikode' },
  { city: 'Feroke', title: 'Feroke', pincode: '673631', district: 'Kozhikode' },
  { city: 'Ramanattukara', title: 'Ramanattukara', pincode: '673633', district: 'Kozhikode' },
  { city: 'Mukkam', title: 'Mukkam', pincode: '673602', district: 'Kozhikode' },
  { city: 'Beypore', title: 'Beypore', pincode: '673015', district: 'Kozhikode' },
  { city: 'Nadapuram', title: 'Nadapuram', pincode: '673504', district: 'Kozhikode' },
  { city: 'Balussery', title: 'Balussery', pincode: '673612', district: 'Kozhikode' },
  { city: 'Thamarassery', title: 'Thamarassery', pincode: '673573', district: 'Kozhikode' },
  { city: 'Koduvally', title: 'Koduvally', pincode: '673572', district: 'Kozhikode' },
  // Wayanad
  { city: 'Kalpetta', title: 'Kalpetta', pincode: '673121', district: 'Wayanad' },
  { city: 'Sulthan Bathery', title: 'Sulthan Bathery', pincode: '673592', district: 'Wayanad' },
  { city: 'Mananthavady', title: 'Mananthavady', pincode: '670645', district: 'Wayanad' },
  { city: 'Vythiri', title: 'Vythiri', pincode: '673576', district: 'Wayanad' },
  { city: 'Pulpally', title: 'Pulpally', pincode: '673579', district: 'Wayanad' },
  { city: 'Panamattom', title: 'Panamattom', pincode: '670646', district: 'Wayanad' },
  { city: 'Thirunelli', title: 'Thirunelli', pincode: '670646', district: 'Wayanad' },
  { city: 'Nenmeni', title: 'Nenmeni', pincode: '673122', district: 'Wayanad' },
  { city: 'Meppadi', title: 'Meppadi', pincode: '673577', district: 'Wayanad' },
  { city: 'Ambalavayal', title: 'Ambalavayal', pincode: '673593', district: 'Wayanad' },
  { city: 'Muttil', title: 'Muttil', pincode: '673122', district: 'Wayanad' },
  { city: 'Vellamunda', title: 'Vellamunda', pincode: '670731', district: 'Wayanad' },
  // Kannur
  { city: 'Kannur', title: 'Kannur Town', pincode: '670001', district: 'Kannur' },
  { city: 'Thalassery', title: 'Thalassery', pincode: '670101', district: 'Kannur' },
  { city: 'Payyanur', title: 'Payyanur', pincode: '670307', district: 'Kannur' },
  { city: 'Taliparamba', title: 'Taliparamba', pincode: '670141', district: 'Kannur' },
  { city: 'Iritty', title: 'Iritty', pincode: '670703', district: 'Kannur' },
  { city: 'Koothuparamba', title: 'Koothuparamba', pincode: '670643', district: 'Kannur' },
  { city: 'Mattannur', title: 'Mattannur', pincode: '670702', district: 'Kannur' },
  { city: 'Kannavam', title: 'Kannavam', pincode: '670650', district: 'Kannur' },
  { city: 'Sreekandapuram', title: 'Sreekandapuram', pincode: '670631', district: 'Kannur' },
  { city: 'Peringome', title: 'Peringome', pincode: '670306', district: 'Kannur' },
  { city: 'Pappinisseri', title: 'Pappinisseri', pincode: '670561', district: 'Kannur' },
  { city: 'Chokli', title: 'Chokli', pincode: '670672', district: 'Kannur' },
  // Kasaragod
  { city: 'Kasaragod', title: 'Kasaragod Town', pincode: '671121', district: 'Kasaragod' },
  { city: 'Kanhangad', title: 'Kanhangad', pincode: '671315', district: 'Kasaragod' },
  { city: 'Nileshwaram', title: 'Nileshwaram', pincode: '671314', district: 'Kasaragod' },
  { city: 'Hosdurg', title: 'Hosdurg', pincode: '671315', district: 'Kasaragod' },
  { city: 'Bekal', title: 'Bekal', pincode: '671316', district: 'Kasaragod' },
  { city: 'Kumbla', title: 'Kumbla', pincode: '671321', district: 'Kasaragod' },
  { city: 'Manjeshwaram', title: 'Manjeshwaram', pincode: '671323', district: 'Kasaragod' },
  { city: 'Vellarikundu', title: 'Vellarikundu', pincode: '671533', district: 'Kasaragod' },
  { city: 'Udma', title: 'Udma', pincode: '671319', district: 'Kasaragod' },
  { city: 'Pallikkara', title: 'Pallikkara', pincode: '671316', district: 'Kasaragod' },
  { city: 'Kasaragod Town', title: 'Kasaragod Town Area', pincode: '671123', district: 'Kasaragod' },
  { city: 'Bedadka', title: 'Bedadka', pincode: '671541', district: 'Kasaragod' },
];

async function seedLocations() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const existing = await Location.countDocuments();
    if (existing > 0 && !isForce) {
      console.log(`Location collection already has ${existing} documents.`);
      console.log('Skipping seed to avoid duplicates. Run with --force to drop and re-seed.');
      await mongoose.disconnect();
      process.exit(0);
      return;
    }
    if (existing > 0 && isForce) {
      await Location.deleteMany({});
      console.log('Dropped existing Location documents.');
    }

    const docs = KERALA_CITIES.map((loc, index) => ({
      locationId: index + 1,
      city: loc.city,
      title: loc.title,
      pincode: loc.pincode,
      district: loc.district,
    }));

    await Location.insertMany(docs);
    console.log(`Inserted ${docs.length} Kerala cities into Location collection.`);

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seedLocations();
