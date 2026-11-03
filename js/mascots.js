/* the dumb gang — line-doodle mascots redrawn from their logo.
   injected as an inline sprite so <svg><use href="#m-heart"/></svg> works everywhere (even file://). */
(() => {
  const face = (y, happy) => happy
    ? `<path d="M42 ${y} q3 -3.5 6 0 M52 ${y} q3 -3.5 6 0 M46 ${y + 8} q4 3 8 0"/>`
    : `<path d="M42 ${y} q3 3 6 0 M52 ${y} q3 3 6 0 M46 ${y + 7} q4 3 8 0"/>`;
  const legs = (l, r) => `
    <path d="M${l} 146 L${l - 1} 160 Q${l - 1} 163 ${l + 3} 163 L${l + 12} 163 Q${l + 14} 163 ${l + 13} 160 L${l + 12} 144"/>
    <path d="M${r} 146 L${r + 1} 160 Q${r + 1} 163 ${r - 3} 163 L${r - 12} 163 Q${r - 14} 163 ${r - 13} 160 L${r - 12} 144"/>
    <path d="M${l + 12} 144 Q50 139 ${r - 12} 144"/>`;

  const sprite = `
  <svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">
    <!-- arms make a heart over its head (logo, left) -->
    <symbol id="m-heart" viewBox="0 0 100 170" preserveAspectRatio="none">
      <path d="M50 40 C 46 24, 34 16, 24 24 C 10 36, 14 64, 34 76"/>
      <path d="M50 40 C 54 24, 66 16, 76 24 C 90 36, 86 64, 66 76"/>
      <path d="M45 47 C 41 35, 33 31, 28 37 C 22 45, 26 58, 38 66"/>
      <path d="M55 47 C 59 35, 67 31, 72 37 C 78 45, 74 58, 62 66"/>
      <path d="M38 66 C 40 55, 60 55, 62 66"/>
      ${face(71)}
      <path d="M34 76 C 30 100, 31 126, 35 146"/>
      <path d="M66 76 C 70 100, 69 126, 65 146"/>
      ${legs(35, 65)}
    </symbol>

    <!-- tree pose, palms up top (logo, middle) -->
    <symbol id="m-yoga" viewBox="0 0 100 170" preserveAspectRatio="none">
      <path d="M47 34 L48.5 6 Q50 1 51.5 6 L53 34"/>
      <path d="M47 34 C 30 38, 22 58, 34 72"/>
      <path d="M53 34 C 70 38, 78 58, 66 72"/>
      <path d="M47 42 C 36 46, 33 56, 39 63"/>
      <path d="M53 42 C 64 46, 67 56, 61 63"/>
      <path d="M39 63 C 40 53, 60 53, 61 63"/>
      ${face(68)}
      <path d="M34 72 C 31 92, 33 110, 40 124"/>
      <path d="M66 72 C 69 92, 67 110, 60 124"/>
      <path d="M52 124 L52 160 Q52 163 56 163 L66 163 Q68 163 66 160 L61 157 L60 124"/>
      <path d="M40 124 C 24 126, 18 142, 30 146 C 38 148, 46 145, 52 141"/>
      <path d="M44 131 C 35 133, 31 139, 37 140 L52 136"/>
    </symbol>

    <!-- hands on cheeks, shy (logo, right) -->
    <symbol id="m-shy" viewBox="0 0 100 170" preserveAspectRatio="none">
      <path d="M30 148 C 24 110, 26 64, 50 60 C 74 64, 76 110, 70 148"/>
      <path d="M31 120 C 22 106, 25 88, 35 85 C 42 83, 45 90, 41 97 C 38 102, 37 107, 39 112"/>
      <path d="M69 120 C 78 106, 75 88, 65 85 C 58 83, 55 90, 59 97 C 62 102, 63 107, 61 112"/>
      ${face(80, true)}
      ${legs(31, 69)}
    </symbol>

    <!-- peeking over an edge -->
    <symbol id="m-peek" viewBox="0 0 120 72">
      <path d="M28 70 C 26 32, 44 14, 60 14 C 76 14, 94 32, 92 70"/>
      <path d="M12 70 C 10 58, 20 53, 27 58 C 30 60, 31 64, 31 70"/>
      <path d="M108 70 C 110 58, 100 53, 93 58 C 90 60, 89 64, 89 70"/>
      <path d="M17 61 v9 M22 58 v12 M103 61 v9 M98 58 v12"/>
      <path d="M46 42 q4 -4.5 8 0 M66 42 q4 -4.5 8 0 M53 53 q7 5 14 0"/>
    </symbol>

    <!-- one arm waving, for the dance floor -->
    <symbol id="m-wave" viewBox="0 0 100 170" preserveAspectRatio="none">
      <path d="M36 68 C 34 50, 66 50, 64 68"/>
      ${face(64)}
      <path d="M64 70 C 74 58, 80 40, 78 24 C 77 18, 84 16, 86 22 C 89 38, 82 62, 68 82"/>
      <path d="M80 20 l-4 -8 M85 18 l2 -9 M74 26 l-7 -4"/>
      <path d="M36 68 C 28 76, 20 92, 24 104 C 26 110, 32 108, 33 102"/>
      <path d="M34 82 C 30 104, 31 126, 35 146"/>
      <path d="M68 82 C 70 104, 69 126, 65 146"/>
      ${legs(35, 65)}
    </symbol>
  </svg>`;

  document.body.insertAdjacentHTML("afterbegin", sprite);
})();
