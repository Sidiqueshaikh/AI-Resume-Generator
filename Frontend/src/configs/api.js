import axios from 'axios'

const api = axios.create({
    baseURL:import.meta.env.VITE_BASED_URL
})

export default api