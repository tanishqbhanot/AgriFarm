const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const JWT_SECRET = "secret"

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const WEATHER_API_KEY = '24e24b9b1164a4eb7911fd436551dd81';

app.get('/', (req, res) => {
  res.render('weather', { rainfall: null, location: null });
});

// Handle the Fetch request for rainfall data
app.post('/get-rainfall', async (req, res) => {
  const { latitude, longitude } = req.body;
  const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=PRECTOTCORR&community=AG&longitude=${longitude}&latitude=${latitude}&format=JSON`;

  try {
    const response = await axios.get(url);
    console.log('API Response:', response.data);  // Log the full response

    const monthlyData = response.data?.properties?.parameter?.PRECTOTCORR;
    if (!monthlyData) throw new Error('Missing PRECTOTCORR data');

    // Number of days in each month (assuming a common year)
    const daysInMonth = {
      JAN: 31, FEB: 28, MAR: 31, APR: 30, MAY: 31, JUN: 30,
      JUL: 31, AUG: 31, SEP: 30, OCT: 31, NOV: 30, DEC: 31
    };

    // Calculate total annual rainfall in mm
    let totalRainfall = 0;
    for (const month in monthlyData) {
      if (month !== 'ANN') {
        const dailyPrecipitation = monthlyData[month];
        const days = daysInMonth[month];
        totalRainfall += dailyPrecipitation * days;
      }
    }

    res.json({
      rainfall: totalRainfall.toFixed(2),  // Total annual rainfall in mm
      location: { lat: parseFloat(latitude).toFixed(4), lon: parseFloat(longitude).toFixed(4) },
    });
  } catch (error) {
    console.error('Error fetching rainfall:', error.message);
    res.json({
      error: 'No data available or invalid location',
    });
  }
});




app.post('/get-weather', async (req, res) => {
  const { latitude, longitude } = req.body;
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly&units=metric&appid=${WEATHER_API_KEY}`;

  try {
    const response = await axios.get(url);
    const weatherData = response.data;
    const dailyForecasts = weatherData.daily;
    const alerts = weatherData.alerts || []; // Weather warnings

    // Process forecast for tomorrow, next week, and next 15 days
    const tomorrow = dailyForecasts[1];

    // Warning for rain or dry spells
    const warnings = alerts.length > 0 ? alerts.map(alert => alert.event) : ['No warnings'];

    res.json({
      tomorrow: tomorrow,
      nextWeek: nextWeek,
      next15Days: next15Days,
      warnings: warnings,
    });
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    res.json({ error: 'Unable to fetch weather data.' });
  }
});






//User management--------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.render('login');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.render('login');
  }
}

app.post('/createUser', async (req, res) => {
  const { name, email, password, address } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      address,
      password: hashedPassword
    });

    await newUser.save();

    res.json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
})


app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 86400000
    });

    res.json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
})

app.get('/createUser', (req, res) => {
  res.render('createUser');
})

app.get('/login', (req, res) => {
  res.render('login');
})

//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------





//Field Management-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.post('/createField', isLoggedIn, async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      length,
      breadth,
      crop,
      lastNPK,
      lastUrea,
      lastLime,
      irrigationFrequency,
      irrigationType,
      soilType,
      moistureLevel,
      notes
    } = req.body;

    const newField = new Field({
      farmerId: req.user._id,
      latitude,
      longitude,
      length,
      breadth,
      crop,
      lastNPK,
      lastUrea,
      lastLime,
      irrigationFrequency,
      irrigationType,
      soilType,
      moistureLevel,
      notes
    });

    await newField.save();
    res.status(201).json({ message: 'Field added successfully', field: newField });
  } catch (err) {
    console.error('Error adding field:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
})


app.get('/addField', isLoggedIn, async (req, res) => {
  res.render('addfield');
})



//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

mongoose.connect('mongodb://127.0.0.1:27017/farmDB');

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));


// predict

axios.post('http://localhost:5000/jsonrec', jsonData)
  .then(response => {
    console.log('Response from Flask:', response.data);
  })
  .catch(error => {
    console.error('Error sending JSON:', error.message);
  });


