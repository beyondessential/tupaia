export async function oneSecondSleep() {
  return sleep(1000);
}

export function sleep(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}
