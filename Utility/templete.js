const acceptForm = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>State Form</title>
</head>
<body style="margin: 0; padding: 0; overflow: hidden;">
    <div style="width: 100%; background-color: #4CCD99; display: flex;justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif; display: flex; flex-flow: column; justify-content: center; align-items: center;">
        <img style="width: 60px; height: 60px; object-fit: contain; border: 6px solid #fff;  border-radius: 50%; margin-bottom: 20px;" src="https://i.pinimg.com/564x/f6/04/7a/f6047ac09f4bc513b8af2d383f1894cd.jpg" alt="accepted image" >
        <h1 style="font-size: 24px; margin: 0; color: #fff; line-height: 1.5;">Your Request has been accepted</h1>
    </div>
</body>
</html>
`
const refuseForm = 
`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>State Form</title>
</head>
<body style="margin: 0; padding: 0;">
    <div style="background-color: #790f01; height: 100vh; display: flex; justify-content: center; align-items: center; text-align: center;">
        <img style="width: 60px; height: 60px; object-fit: contain; border: 6px solid #fff;  border-radius: 10%; margin-bottom: 20px;" src="https://i.pinimg.com/564x/74/bb/72/74bb7291d0ec2524835615deadd42047.jpg" alt="accepted image" >
        <h1 style="font-size: 24px; margin: 0; line-height: 1.5;">Sorry, Admin refused your request</h1>
        <p>Please try again later </p>
    </div>
</body>
</html>
`

module.exports = {acceptForm,refuseForm}