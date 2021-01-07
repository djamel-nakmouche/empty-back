
exports.passwordSyntaxeValidation = (password) => {
    const upperCase =["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
    const lowerCase =["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
    const numbers = ["0","1","2","3","4","5","6","7","8","9"]
    const specialCharacters = ["!",'#',"$","%","&","*","+","-","/",":",";","<","=",">","?","@","[","\\","]","^","_","{","|","}","~","]"]
    
    let isMinimalNumber = (password.length >=8)
    let containUpperCase = false
    let containLowerCase = false
    let containNumber = false
    let containSpecial = true

    for(let index in upperCase){
        for(let index2 in password){
            let char = password[index2]
            if(upperCase[index] == char){containUpperCase = true; break}
        }
    }

    for(let index in lowerCase){
        for(let index2 in password){
            let char = password[index2]
            if(lowerCase[index] == char){containLowerCase = true; break}
        }
    }

    for(let index in numbers){
        for(let index2 in password){
            let char = password[index2]
            if(numbers[index] == char){containNumber = true;break}
        }
    }

    // for(let index in specialCharacters){
    //     for(let index2 in password){
    //         let char = password[index2]
    //         if(specialCharacters[index] == char){containSpecial = true;break}
    //     }
    // }
    let validation = (isMinimalNumber && containUpperCase && containLowerCase && containNumber && containSpecial)
    return validation
}

exports.twoDigitMonthCreator = (month) => {
    if (+month<10) {
        return `0${month}`
    } else {
        return `${month}`
    }
}

exports.getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
  }

exports.pseudoSyntaxeValidation = (pseudo) => {
    const upperCase =["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
    const lowerCase =["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
    const numbers = ["0","1","2","3","4","5","6","7","8","9"]
    const specialCharacters = ["_"]
    
    let authorizedChar = upperCase.concat(lowerCase, numbers, specialCharacters);

    let pseudo_ok = true;
    for(let index in pseudo){
        if(!authorizedChar.includes(pseudo[index])){pseudo_ok=false}
    }
    if(pseudo.length<4){pseudo_ok=false}
    
    return pseudo_ok
}



exports.objectToQueryParamsString = (object) => {
    const keys = Object.keys(object)
    let string = '?'
    for(let index in keys){
        let and = ''
        if(index!=0){and = '&'}
        let elem = `${and}${keys[index]}=${object[keys[index]]}` 
        string = string.concat(elem)
    }

    return string
}