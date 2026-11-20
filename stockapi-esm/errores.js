export class ErrorNegocio extends Error {
    constructor(mensaje, status = 400) {
        super(mensaje)
        this.status = status
    }
}

export const responderError = (req, res, error) => {
    res.status(error.status || 500).json({ url: req.url, method: req.method, error: error.message })
}
