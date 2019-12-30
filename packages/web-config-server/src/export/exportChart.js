import { USER_SESSION_CONFIG } from '/authSession';
import { exportChartScreenshot } from './exportChartScreenshot';
import { exportChartToExcel } from './exportChartToExcel';

export const exportChart = () => async (req, res) => {
  const { email } = req.session.userJson;
  const sessionCookieName = USER_SESSION_CONFIG.cookieName;
  const sessionCookie = req.cookies[sessionCookieName];
  const chartConfig = req.body;

  if (chartConfig.selectedFormat === 'xlsx') {
    await exportChartToExcel(chartConfig, sessionCookieName, sessionCookie, email);
  } else {
    await exportChartScreenshot(chartConfig, sessionCookieName, sessionCookie, email);
  }

  res.send({ success: true });
};
