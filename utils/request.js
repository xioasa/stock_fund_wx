
const request = (argus = {}) => {
  wx.request({ ...argus,
    success(res) {
      argus.success && argus.success(res);
    },
    fail(res) {
      argus.fail && argus.fail(res);
    }
  });
}

module.exports = request;