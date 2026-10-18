import './PerformanceVisual.css';

/**
 * FitTrack 2.0 Abstract Athletic Performance Visual
 * Renders the glowing human silhouette and energy particle fields.
 */
export default function PerformanceVisual({ className = '' }) {
  return (
    <svg
      className={`performance-visual ${className}`}
      viewBox="0 0 800 650"
      role="img"
      aria-label="Abstract athletic human silhouette surrounded by flowing lime energy"
    >
      <defs>
        <radialGradient id="sceneGlow" cx="66%" cy="46%" r="48%">
          <stop offset="0%" stopColor="#b9f34b" stopOpacity=".13" />
          <stop offset="48%" stopColor="#6f9539" stopOpacity=".045" />
          <stop offset="100%" stopColor="#0b0d0c" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="bodyGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8f0df" stopOpacity=".48" />
          <stop offset="22%" stopColor="#758172" stopOpacity=".2" />
          <stop offset="52%" stopColor="#202520" stopOpacity=".72" />
          <stop offset="78%" stopColor="#a7bb9a" stopOpacity=".19" />
          <stop offset="100%" stopColor="#111411" stopOpacity=".9" />
        </linearGradient>

        <linearGradient id="bodyEdge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eef5e8" stopOpacity=".45" />
          <stop offset="42%" stopColor="#b9f34b" stopOpacity=".16" />
          <stop offset="100%" stopColor="#242b23" stopOpacity=".12" />
        </linearGradient>

        <linearGradient id="energyLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b9f34b" stopOpacity="0" />
          <stop offset="35%" stopColor="#b9f34b" stopOpacity=".95" />
          <stop offset="70%" stopColor="#dfff9f" stopOpacity=".66" />
          <stop offset="100%" stopColor="#b9f34b" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="glassRibbon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9f8ce" stopOpacity=".16" />
          <stop offset="50%" stopColor="#b9f34b" stopOpacity=".045" />
          <stop offset="100%" stopColor="#f6fff0" stopOpacity=".11" />
        </linearGradient>

        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="13" />
        </filter>

        <filter id="bodyShadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="24" stdDeviation="20" floodColor="#000000" floodOpacity=".56" />
        </filter>
      </defs>

      <rect width="800" height="650" fill="url(#sceneGlow)" />
      <ellipse className="visual-orbit orbit-one" cx="545" cy="326" rx="220" ry="112" />
      <ellipse
        className="visual-orbit orbit-two"
        cx="536"
        cy="337"
        rx="158"
        ry="252"
        transform="rotate(16 536 337)"
      />

      <g className="energy-ribbon">
        <path
          d="M255 420 C326 338 355 215 478 188 C601 161 696 225 676 320 C658 405 556 424 481 388 C392 346 383 292 317 309 C264 322 245 377 255 420Z"
          fill="url(#glassRibbon)"
          stroke="#d7ff8c"
          strokeOpacity=".13"
        />
        <path
          d="M216 419 C316 369 322 245 462 197 C588 154 715 224 676 335 C645 424 524 439 420 379 C340 333 295 347 216 419"
          fill="none"
          stroke="url(#energyLine)"
          strokeWidth="6"
          strokeLinecap="round"
          className="energy-line"
        />
        <path
          d="M242 438 C340 402 369 457 482 451 C592 446 678 385 684 292"
          fill="none"
          stroke="#b9f34b"
          strokeOpacity=".15"
          strokeWidth="34"
          strokeLinecap="round"
          filter="url(#softGlow)"
        />
      </g>

      <g className="athlete-form" filter="url(#bodyShadow)">
        <circle cx="526" cy="137" r="48" fill="url(#bodyGlass)" stroke="url(#bodyEdge)" strokeWidth="1.2" />
        <path
          d="M470 191 C489 169 553 169 578 195 C602 220 600 265 585 305
             C574 336 565 365 572 400 C543 419 486 414 458 391
             C470 352 458 328 446 297 C428 251 438 217 470 191Z"
          fill="url(#bodyGlass)"
          stroke="url(#bodyEdge)"
          strokeWidth="1.4"
        />
        <path
          d="M462 206 C425 224 391 255 367 297 C355 318 365 340 386 342
             C402 344 411 329 419 314 L480 243Z"
          fill="url(#bodyGlass)"
          stroke="url(#bodyEdge)"
          strokeWidth="1.2"
        />
        <path
          d="M575 208 C613 223 645 252 669 289 C683 311 676 334 655 338
             C638 341 627 328 618 313 L560 241Z"
          fill="url(#bodyGlass)"
          stroke="url(#bodyEdge)"
          strokeWidth="1.2"
        />
        <path
          d="M478 393 C454 426 432 470 416 541 C412 563 424 580 445 581
             C461 582 471 570 477 550 L516 422Z"
          fill="url(#bodyGlass)"
          stroke="url(#bodyEdge)"
          strokeWidth="1.2"
        />
        <path
          d="M528 414 L562 548 C568 570 582 581 601 578 C620 575 628 558 621 536
             C603 472 586 426 566 398Z"
          fill="url(#bodyGlass)"
          stroke="url(#bodyEdge)"
          strokeWidth="1.2"
        />
        <path d="M480 247 C507 265 548 264 575 244" fill="none" stroke="#eaffc0" strokeOpacity=".13" />
        <path d="M467 318 C503 337 544 337 580 315" fill="none" stroke="#b9f34b" strokeOpacity=".12" />
      </g>

      <g className="energy-particles" fill="#caff72">
        <circle cx="330" cy="227" r="3.2" opacity=".72" />
        <circle cx="693" cy="253" r="2.2" opacity=".48" />
        <circle cx="637" cy="444" r="2.8" opacity=".58" />
        <circle cx="385" cy="487" r="1.8" opacity=".42" />
        <circle cx="707" cy="382" r="1.5" opacity=".34" />
      </g>
      <ellipse cx="525" cy="588" rx="142" ry="21" fill="#000000" opacity=".48" filter="url(#softGlow)" />
    </svg>
  );
}
