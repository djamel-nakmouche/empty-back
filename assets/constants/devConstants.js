
exports.DNS = () => {
    let serverURL
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        serverURL = 'http://localhost:3000'     
    } else {
        serverURL = 'http://chkouneflane.com'
    }
    return serverURL
}


