function tokenToCookie(res, data) {
    console.log(data);
    if (data.success) {
        return res
            .cookie("jwt", data.tokens.refreshToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 24 * 60 * 60 * 1000, // equivale a 1d en milisegundos
                /* expiresIn: "7d", cual es la diferencia contra maxAge */
            })
            .json({
                success: data.success,
                user: data.user, // creo que no debería devolver al usuario
                accessToken: data.tokens.accessToken,
            });
    }
    return res.status(data.status).json(data.message);
}

module.exports = tokenToCookie;
