const mongoose = require('mongoose');

const launchesSchema = new mongoose.Schema({
    flightNumber: {
        type: Number,
        required: true,
        unique: true,
    },

    upcoming: {
        type: Boolean,
        required: true,
    },

    success: {
        type: Boolean,
        required: true,
    },

    customers: [String],

    mission: {
        type: String,
        required: true
    },

    launchDate: {
        type: Date,
        required: true
    },

    rocket: {
        type: String,
        required: true
    },

    target: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Launch', launchesSchema);