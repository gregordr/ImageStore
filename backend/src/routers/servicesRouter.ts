import express from 'express';

export const router = express.Router();

export const registeredServices: { [serviceName: string]: Set<string> } = {}

router.post("/register", async (req, res) => {
    const { names, port } = req.body

    for (const name of names) {
        if (!registeredServices[name]) registeredServices[name] = new Set()

        registeredServices[name].add(req.ip + ":" + port)

    }

    console.log(`Registered ${names} at ${port}`)

    res.status(200).send()
})

router.post("/check", async (req, res) => {
    const { serviceName } = req.body

    res.status(200).send(registeredServices[serviceName] && registeredServices[serviceName].size > 0)
})