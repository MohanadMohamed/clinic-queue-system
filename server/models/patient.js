const mongoose = require("mongoose")

const patientSchema = new mongoose.Schema({
    name: String,
    status: String,
    createdAt: String
})

module.exports = mongoose.model("Patient", patientSchema)