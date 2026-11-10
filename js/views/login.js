// Sign-in screen.

export function loginView() {
  return `<section class="panel login"><div class="head"><span class="eyebrow">Student portal</span><h1>Sign in</h1></div>`
    + `<form id="loginForm"><label for="lu">Username</label><input id="lu" name="username" autocomplete="username" autocapitalize="none" required>`
    + `<label for="lp">Password</label><input id="lp" name="password" type="password" autocomplete="current-password" required>`
    + `<p class="err" id="lerr" role="alert" hidden></p><button class="btn primary" id="lbtn" type="submit">Sign in</button></form></section>`;
}

export const LOGIN_ERRORS = {
  wrong: "Wrong username or password.",
  offline: "Can't reach the database. Check your connection and try again.",
  expired: "Your saved sign-in no longer works. Sign in again.",
};
