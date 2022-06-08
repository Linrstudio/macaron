// .vitepress/theme/index.js
import DefaultTheme from "vitepress/theme";
import "@fontsource/readex-pro/400.css";
import "@fontsource/readex-pro/500.css";
import "@fontsource/readex-pro/600.css";
import "@fontsource/readex-pro/700.css";
import "./custom.css";

export default DefaultTheme;

// document.body.insertAdjacentHTML(
//   "beforeend",
//   `<script async src="https://www.googletagmanager.com/gtag/js?id=G-9SL80BL0ZZ"></script>
//   <script>
//     window.dataLayer = window.dataLayer || [];
//     function gtag(){dataLayer.push(arguments);}
//     gtag('js', new Date());

//     gtag('config', 'G-9SL80BL0ZZ');

//     console.log('gtag loaded');
//   </script>`
// );

const gtag = document.createElement("script");
gtag.src = "https://www.googletagmanager.com/gtag/js?id=G-9SL80BL0ZZ";
document.body.appendChild(gtag);

const script = document.createElement("script");
script.textContent = `    window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-9SL80BL0ZZ', {debug_mode: true});
console.log('gtag loaded');
`;
document.body.appendChild(script);

const pageView = () => {
  setTimeout(() => {
    console.log("location changed!", location.pathname, document.title);
    window.gtag("config", "G-9SL80BL0ZZ", {
      page_path: location.pathname,
      page_title: document.title,
      debug_mode: true,
    });
  }, 100);
};

window.history.pushState = new Proxy(window.history.pushState, {
  apply: (target, thisArg, argArray) => {
    // trigger here what you need

    const ret = target.apply(thisArg, argArray);
    pageView();
    return ret;
  },
});

window.addEventListener("pushstate", function () {
  pageView();
});
window.addEventListener("popstate", function () {
  pageView();
});
