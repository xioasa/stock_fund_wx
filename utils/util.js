/**
 * 获取日期时间
 * @param {*} type 
 * @param {*} symbol 
 */
const getTime = (type = 'day', symbol = "-") => {
  const now = new Date();
  const year = now.getFullYear(); //得到年份
  const month = now.getMonth() + 1;//得到月份
  let date = now.getDate();//得到日期
  const hour = now.getHours();//得到小时
  const minu = now.getMinutes();//得到分钟
  const sec = now.getSeconds();//得到秒
  if (date <= 9) {
    date = `0${date}`
  }
  if (type === 'day') {
    return `${year}${symbol}${month}${symbol}${date}`
  }
  return `${year}-${month}-${date} ${hour}-${minu}-${sec}`
}

const guid = () => {
  const uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  }).toUpperCase();
  return uid;
};

module.exports = {
  getTime,
  guid
}
