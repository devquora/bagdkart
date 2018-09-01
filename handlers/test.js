console.log('in test.js');

const test = (req, res, next)=> {
    console.log('in test function');
    res.status(200).send({
        success: true
    });
};

const postTest = (req, res, next) => {
    let value = req.body.value;
    res.status(200).send({
        success: true,
        message: 'post working',
        value: value
    });
};

module.exports = {
    test,
    postTest
}