function addCookie(res, instruction) {
    const { accessToken, newRefreshToken, user } = instruction;
    return res
        .cookie("jwt", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 24 * 60 * 60 * 1000,
        })
        .json({ accessToken, user });
}

function clearCookie(res) {
    res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        /*       maxAge: 24 * 60 * 60 * 1000, investigar para que sirve */
    });
}

function clearCookieAndReturnJson(res, instruction) {
    return res
        .clearCookie("jwt", {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            /*       maxAge: 24 * 60 * 60 * 1000, investigar para que sirve */
        })
        .json({ message: instruction.message });
}

function handleTokenToCookie(res, response) {
    response.instructions.forEach((instruction) => {
        if (instruction.action === "addCookie") {
            addCookie(res, instruction);
        }

        if (instruction.action === "clearCookie") {
            clearCookie(res);
        }

        if (instruction.action === "clearCookieAndReturnJson") {
            clearCookieAndReturnJson(res, instruction);
        }
    });
}

module.exports = handleTokenToCookie;
