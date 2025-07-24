const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

// Add a new doctor
router.post('/doctors', async (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    try {
        const doctor = new Doctor({
            name,
            address,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
        });

        await doctor.save();
        res.status(201).json(doctor);
    } catch (error) {
        res.status(500).json({ message: 'Error adding doctor', error });
    }
});

// Search doctors by location
// router.get('/doctors/search', async (req, res) => {
//   const { latitude, longitude, maxDistance } = req.query;

//   // Validate query parameters
//   if (!latitude || !longitude) {
//     return res.status(400).json({ message: 'Latitude and longitude are required' });
//   }

//   const lat = parseFloat(latitude);
//   const lng = parseFloat(longitude);

//   if (isNaN(lat) || isNaN(lng)) {
//     return res.status(400).json({ message: 'Latitude and longitude must be valid numbers' });
//   }

//   try {
//     const doctors = await Doctor.find({
//       location: {
//         $near: {
//           $geometry: {
//             type: 'Point',
//             coordinates: [lng, lat],
//           },
//           $maxDistance: parseFloat(maxDistance) || 10000, // Default 10km
//         },
//       },
//     });

//     res.json(doctors);
//   } catch (error) {
//     res.status(500).json({ message: 'Error searching doctors', error });
//   }
// });

router.get('/doctors/search', async (req, res) => {
    const { latitude, longitude, maxDistance } = req.query;

    // Validate query parameters
    if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ message: 'Latitude and longitude must be valid numbers' });
    }

    try {
        const doctors = await Doctor.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat],
                    },
                    $maxDistance: parseFloat(maxDistance) || 10000, // Default 10km
                },
            },
        });

        // Transform the response to include latitude and longitude as top-level fields
        const doctorsWithCoordinates = doctors.map(doctor => ({
            _id: doctor._id,
            name: doctor.name,
            address: doctor.address,
            latitude: doctor.location.coordinates[1],
            longitude: doctor.location.coordinates[0],
            location: doctor.location,
            __v: doctor.__v
        }));

        res.json(doctorsWithCoordinates);
    } catch (error) {
        res.status(500).json({ message: 'Error searching doctors', error });
    }
});

module.exports = router;