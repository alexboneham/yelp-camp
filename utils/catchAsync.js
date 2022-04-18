module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};

// Logic is as follows:
//     return a function,
//     that accepts a function,
//     and executes that function,
//     but catches any errors and passes them to next()
