# AROWGO --- Complete Game Development Masterplan

**Document version:** 1.0\
**Date:** 8 November 2026\
**Product:** AROWGO\
**Category:** Casual logic / arrow-extraction puzzle\
**Initial platform:** Android\
**Prototype platform:** Web / PWA\
**Working tagline:** Think. Clear. Go.\
**Status:** Pre-production

------------------------------------------------------------------------

## 1. Executive summary

AROWGO is an original, mobile-first casual puzzle game built around a
simple interaction: players clear directional arrow tiles from a board
by selecting arrows whose exit paths are unobstructed.

The business hypothesis is that a small, polished puzzle game can
attract players through short-form gameplay content, retain a subset
through satisfying level progression and daily challenges, and generate
revenue through carefully placed advertising and optional purchases.

The first release is deliberately narrow. It will prioritize a
satisfying core loop, reliable level design, fast startup, offline play,
clear onboarding and measurable retention over a large feature list.

**The first objective is not to maximize downloads or advertising
impressions. It is to prove that real players understand the game, enjoy
it, return to it and are willing to tolerate optional monetization.**

No revenue, download count or launch date is guaranteed. Decisions to
scale will be based on observed product and financial metrics.

## 2. Product vision and positioning

### Vision

Create a clean, satisfying puzzle game that can be understood in
seconds, offers meaningful problem-solving, and is enjoyable in short
sessions.

### Target player hypothesis

Initial audience to test:

-   People who enjoy casual logic and puzzle games.
-   Players who prefer short, self-contained levels.
-   Players who enjoy satisfying visual feedback and gradual difficulty.
-   Mobile players who want a game that works without an account.

This is a hypothesis, not a validated audience definition. Testing
should identify who actually enjoys the game.

### Product principles

1.  **Instant comprehension:** the first interaction should be obvious.
2.  **Fair challenge:** difficulty should come from reasoning, not
    unclear rules.
3.  **Satisfying feedback:** every valid move should feel responsive.
4.  **Respectful monetization:** no disruptive ads during active play.
5.  **Fast sessions:** players should be able to complete a level in a
    short break.
6.  **Low friction:** no mandatory account or network connection for
    core gameplay.
7.  **Original identity:** use familiar genre conventions without
    copying competitors' code, art, level layouts, names or branding.

## 3. Core game concept

### Core loop

1.  A board appears containing directional arrow tiles.
2.  The player selects an arrow.
3.  The game checks whether the arrow's path to the board boundary is
    clear.
4.  If clear, the arrow exits the board with an animation.
5.  If blocked, the arrow remains and the game gives clear feedback.
6.  The player continues until all arrows are cleared.
7.  The player receives a completion result and proceeds to the next
    level.

### Core rules

-   Each arrow has a grid position and one direction.
-   An arrow can exit only if no other active tile occupies the cells
    between its position and the board boundary in its direction.
-   A valid move removes the arrow from the active board.
-   An invalid move does not alter the board state.
-   A level is complete when no active arrows remain.
-   A level must be validated as solvable before it is shipped.

### Original design hook: Relay tiles

A later content update may introduce relay tiles that alter the
direction of connected arrows or otherwise change board logic.

This mechanic must be prototyped and playtested separately. It should
not be included in the first playable build until the base mechanic is
understandable and enjoyable.

### First release content

Target: **40 handcrafted levels**, subject to playtesting.

  -----------------------------------------------------------------------
  Level range             Intended difficulty     Teaching goal
  ----------------------- ----------------------- -----------------------
  1--5                    Tutorial                Learn selection,
                                                  direction and exit
                                                  rules

  6--10                   Easy                    Understand blockers and
                                                  move order

  11--20                  Medium                  Plan several moves
                                                  ahead

  21--30                  Hard                    Handle denser boards
                                                  and more constrained
                                                  sequences

  31--40                  Advanced                Combine established
                                                  rules without surprise
                                                  mechanics
  -----------------------------------------------------------------------

Do not use level count as a substitute for quality. A smaller set of
well-tested levels is preferable to many repetitive or unsolvable
levels.

## 4. Scope and release boundaries

### MVP --- must ship

-   Main menu and level selection.
-   First-session tutorial.
-   Grid and arrow rendering.
-   Tap input and responsive feedback.
-   Directional path checking.
-   Valid arrow exit animation.
-   Blocked-arrow feedback.
-   Win condition and results screen.
-   Level progression.
-   Restart and undo, if undo does not undermine puzzle integrity.
-   Hint system with a deterministic valid move.
-   Local save for progress and settings.
-   Sound and haptic controls.
-   Offline core gameplay.
-   Basic accessibility: readable contrast, scalable layout, reduced
    reliance on color alone.
-   Basic crash and product analytics, implemented with appropriate
    privacy disclosures.

### After validation

-   Daily challenge.
-   Shareable challenge result.
-   Additional puzzle packs.
-   Expanded relay mechanics.
-   Achievements and streaks.
-   Optional cloud save.
-   Leaderboards, only if they add genuine value.
-   Ad-free purchase.
-   More languages.

### Explicitly out of scope for MVP

-   Multiplayer.
-   Chat or social network features.
-   User accounts.
-   Cash tournaments, wagers, deposits or cash-out.
-   Cryptocurrency.
-   Complex backend services.
-   AI-generated unlimited levels.
-   Paid user acquisition before retention evidence.
-   Unnecessary permissions or collection of personal information.

## 5. UX and visual direction

### Design direction

-   Clean, high-contrast puzzle board.
-   Simple geometric arrow shapes.
-   Restrained color palette with clear directional distinction.
-   Consistent spacing and tile sizing.
-   Smooth but brief animations.
-   Minimal menus and low-friction navigation.
-   Clear sound and haptic settings.
-   No visual clutter around the board.

### Essential screens

1.  **Splash / boot:** quick initialization; no long branded delay.
2.  **Home:** Play, Daily Challenge (when available), Settings.
3.  **Level selection:** current progress and accessible unlocked
    levels.
4.  **Tutorial:** teach one rule at a time with interactive prompts.
5.  **Gameplay:** board, level indicator, pause, undo and hint.
6.  **Pause:** resume, restart, settings.
7.  **Level complete:** clear result, next level and optional rewarded
    hint/reward only where appropriate.
8.  **Settings:** sound, haptics, privacy, support and credits.
9.  **No-network state:** core offline play remains available.

### Interaction requirements

-   Input must feel immediate.
-   Invalid moves must explain why an arrow is blocked.
-   Animations must not prevent rapid valid input for an unreasonable
    duration.
-   Prevent accidental double-processing of a move.
-   Respect device safe areas and different aspect ratios.
-   Support common Android screen sizes and lower-performance devices.

## 6. Technology stack

### Recommended stack

  -----------------------------------------------------------------------
  Layer                   Choice                  Reason
  ----------------------- ----------------------- -----------------------
  Game framework          Phaser 3                Suitable for a 2D grid
                                                  puzzle

  Language                TypeScript              Existing team
                                                  familiarity and
                                                  maintainability

  Build tool              Vite                    Fast local development
                                                  and web builds

  Mobile packaging        Capacitor               Package the web game
                                                  for Android

  Source control          Git + GitHub            Collaboration and
                                                  review

  Web prototype hosting   Vercel or equivalent    Fast tester
                                                  distribution

  Analytics               Privacy-reviewed        Measure product
                          analytics SDK           behaviour

  Ads                     Google AdMob, subject   Advertising
                          to eligibility          monetization

  Purchases               Google Play Billing via Optional digital
                          supported integration   purchase
  -----------------------------------------------------------------------

Pin dependency versions and document upgrades. Do not add a backend,
database, authentication system or SDK without a clear requirement.

### Architecture

Keep puzzle rules independent of rendering and UI. This allows the team
to test the game logic without opening a visual scene.

``` text
arowgo/
├── public/
│   ├── assets/
│   │   ├── images/
│   │   ├── audio/
│   │   └── fonts/
│   └── levels/
│       └── levels.json
├── src/
│   ├── game/
│   │   ├── scenes/
│   │   │   ├── BootScene.ts
│   │   │   ├── MenuScene.ts
│   │   │   ├── GameScene.ts
│   │   │   └── ResultScene.ts
│   │   ├── systems/
│   │   │   ├── BoardManager.ts
│   │   │   ├── PathChecker.ts
│   │   │   ├── MoveResolver.ts
│   │   │   ├── LevelValidator.ts
│   │   │   └── HintResolver.ts
│   │   └── objects/
│   │       ├── ArrowTile.ts
│   │       └── RelayTile.ts
│   ├── ui/
│   ├── data/
│   ├── services/
│   │   ├── SaveManager.ts
│   │   ├── AudioManager.ts
│   │   └── AnalyticsManager.ts
│   ├── config/
│   └── main.ts
├── tests/
│   ├── path-checker/
│   ├── move-resolver/
│   └── level-validation/
├── docs/
├── index.html
├── package.json
└── README.md
```

### Core data model

A level should be data-driven rather than hard-coded into a scene.

Example conceptual level format:

``` json
{
  "id": "level_001",
  "width": 4,
  "height": 4,
  "arrows": [
    { "id": "a1", "x": 0, "y": 0, "direction": "right" },
    { "id": "a2", "x": 2, "y": 0, "direction": "down" },
    { "id": "a3", "x": 2, "y": 2, "direction": "left" }
  ]
}
```

Validate all level data at load time:

-   Unique arrow IDs.
-   Coordinates inside board bounds.
-   No overlapping starting positions.
-   Valid direction values.
-   Board dimensions within supported limits.
-   A valid solution sequence exists.
-   Hint solution matches the actual level state.

### Core logic contracts

**PathChecker** - Input: board state and selected arrow. - Output: clear
or blocked, plus blocker information. - Must not mutate board state.

**MoveResolver** - Input: board state and selected arrow. - Output: a
validated next state or a rejected move. - Must be deterministic.

**LevelValidator** - Input: level definition. - Output: structural
validity and solvability result. - Must run in development/test
workflows.

**HintResolver** - Input: current board state. - Output: one valid next
move or an explicit no-solution error. - Must never recommend an invalid
move.

## 7. Team structure and ownership

Four active contributors are assumed: founder plus three teammates.

  -----------------------------------------------------------------------
  Role                    Primary responsibility  Required outputs
  ----------------------- ----------------------- -----------------------
  Founder / Product &     Product decisions,      Accepted builds,
  Technical Lead          architecture,           priorities, technical
                          integration,            decisions
                          AI-assisted development 
                          and release quality     

  Teammate 1 --- Gameplay Board logic, path       Tested game systems
  Engineer                checking, move          
                          resolution, level       
                          validation              

  Teammate 2 --- Design & UI, visual assets,      Consistent usable game
  UX                      animation, sound and    experience
                          interaction polish      

  Teammate 3 --- Growth & Test recruitment,       Test reports and
  QA                      feedback, short-form    distribution
                          content, analytics      experiments
                          review and QA           
                          coordination            
  -----------------------------------------------------------------------

### Team operating rules

-   One shared backlog.
-   Every task has one accountable owner.
-   Every code change goes through a pull request or documented review.
-   No direct commits to the protected main branch.
-   All assets must have documented provenance and usage rights.
-   Daily progress is demonstrated, not merely reported.
-   Blockers are raised early.
-   Product decisions and scope changes are recorded.

### Ownership and team agreement

Before substantial work begins, document:

-   Source-code ownership.
-   Game name, logo and asset ownership.
-   Contributor roles and compensation.
-   Revenue-sharing terms, if any.
-   Expense approval.
-   Account ownership and access.
-   What happens if a contributor leaves.
-   Rights to reuse general-purpose code or tools.
-   Who is authorized to publish and receive payments.

Because the founder is under 18, have a parent or guardian review the
arrangement with appropriate local legal advice. Do not use an adult
teammate's identity or account in a misleading way.

## 8. Development roadmap

The following is a target schedule beginning 9 November 2026. It is a
planning baseline, not a guaranteed release date.

### Sprint 0 --- Foundation

**Target: 9--10 November**

-   Confirm project roles and written working agreement.
-   Create repository and project board.
-   Initialize Phaser, TypeScript and Vite.
-   Establish linting, formatting and test commands.
-   Create board renderer.
-   Define initial design tokens and tile rules.
-   Agree on the level JSON schema.

**Exit criteria:** project runs locally; all contributors can clone and
run it; a grid renders; first issues are assigned.

### Sprint 1 --- Core prototype

**Target: 11--15 November**

-   Implement arrow entity.
-   Implement directional path checking.
-   Implement valid movement and removal.
-   Implement blocked movement feedback.
-   Implement board completion.
-   Add restart.
-   Create three to ten test levels.
-   Add unit tests for core logic.

**Exit criteria:** a player can clear a small level; invalid moves are
handled correctly; logic tests pass.

### Sprint 2 --- MVP gameplay

**Target: 16--22 November**

-   Main menu and game navigation.
-   Tutorial and first-session flow.
-   Level progression.
-   Undo and restart behaviour.
-   Hint resolver.
-   Local save and restore.
-   Audio and haptic settings.
-   Complete first 40 levels, if quality permits.
-   Add device-resize and touch testing.

**Exit criteria:** an internal player can complete the first content set
without developer assistance.

### Sprint 3 --- Quality and first external tests

**Target: 23--29 November**

-   Test with 20--30 people outside the development team.
-   Observe tutorial completion and confusion.
-   Identify frustrating or trivial levels.
-   Fix crashes, input bugs and layout issues.
-   Check performance on lower-end Android devices.
-   Create store-art and short-video concepts.
-   Review privacy and SDK requirements.

**Exit criteria:** documented external feedback, resolved critical
defects and a prioritized improvement list.

### Sprint 4 --- Retention validation

**Target: 30 November--6 December**

-   Expand to approximately 50--100 testers if recruitment permits.
-   Measure first-session completion and Day-1 return.
-   Improve tutorial, pacing and level difficulty.
-   Prototype daily challenge only if the core loop is working.
-   Prepare Android package and store listing.
-   Confirm publisher, privacy and payment arrangements.

**Exit criteria:** enough real-user evidence to decide whether to
proceed, revise or stop.

### Sprint 5--6 --- Release preparation

**Target: 7--20 December and beyond**

-   Complete required testing for the chosen publishing account.
-   Test install, update and uninstall/reinstall behaviour.
-   Verify offline functionality.
-   Integrate advertising only after product and policy review.
-   Verify consent, privacy disclosures and SDK behaviour.
-   Complete store assets and content declarations.
-   Submit when eligible.
-   Monitor crashes, reviews, retention and actual revenue.

**Exit criteria:** release approved by the platform, or a clear list of
remaining approval requirements.

## 9. QA and testing strategy

### Core logic tests

Test at minimum:

-   Arrow with an empty exit path.
-   Arrow blocked by one tile.
-   Arrow blocked by several tiles.
-   Arrow at each board edge.
-   Multiple arrows sharing a row or column.
-   Valid move changes board state exactly once.
-   Invalid move leaves board state unchanged.
-   Clearing the final arrow triggers completion once.
-   Restart restores the original board.
-   Undo restores the previous valid state.
-   Save/load restores the same progress.
-   Hint always returns a legal move.

### Level validation

Every shipped level must:

-   Have valid dimensions and tile positions.
-   Have no overlapping starting tiles.
-   Be solvable.
-   Have a known solution path for hinting or debugging.
-   Be playtested for difficulty and clarity.
-   Avoid requiring accidental or ambiguous input.

### Device QA

Test:

-   Small and large Android screens.
-   Different aspect ratios.
-   Touch accuracy.
-   App pause/resume.
-   Audio interruption.
-   Low-memory conditions.
-   Slow startup and first asset load.
-   Offline launch and play.
-   Device rotation behaviour, if rotation is supported.
-   App update and local-save migration.

### Bug severity

  -----------------------------------------------------------------------
  Severity                Example                 Response
  ----------------------- ----------------------- -----------------------
  P0                      Data loss,              Block release
                          security/privacy issue, 
                          app unusable            

  P1                      Core gameplay broken or Block release
                          level unsolvable        

  P2                      Significant UX or       Fix before broad
                          device-specific issue   release where possible

  P3                      Cosmetic or low-impact  Schedule and track
                          issue                   
  -----------------------------------------------------------------------

## 10. Distribution strategy

Distribution is a core workstream, not a final marketing task.

### Initial channels

-   YouTube Shorts.
-   Instagram Reels.
-   Relevant puzzle communities, following their rules.
-   Direct invitations to voluntary beta testers.
-   Store listing optimization after the product is ready.

### Content formats

1.  **Challenge:** show a puzzle and ask viewers to identify the first
    move.
2.  **Satisfying clear:** show a clean sequence of arrows leaving the
    board.
3.  **Solution reveal:** show a difficult puzzle and its solution.
4.  **Progression:** compare an early level with a later one.
5.  **Daily puzzle:** invite viewers to solve the same challenge.

### Initial publishing cadence

-   Aim for two short videos per day during the first distribution
    experiment.
-   Test multiple hooks and video openings.
-   Use clear calls to action.
-   Do not buy views, installs or fake reviews.
-   Do not claim unsupported download numbers or player statistics.
-   Track each post's reach, engagement, profile visits, link clicks and
    resulting installs where measurable.

### Distribution experiments

For each experiment, record:

-   Hypothesis.
-   Creative format.
-   Audience/channel.
-   Number of posts or spend.
-   Views and reach.
-   Link clicks.
-   Store visits.
-   Installs or tester sign-ups.
-   Cost per acquired user, if paid acquisition is later tested.
-   Decision: repeat, revise or stop.

## 11. Analytics and product metrics

Instrument only events needed to make product decisions. Use
privacy-conscious defaults and disclose relevant data collection.

### Suggested events

-   `app_open`
-   `tutorial_started`
-   `tutorial_completed`
-   `level_started`
-   `level_completed`
-   `level_failed` (if a failure state exists)
-   `hint_used`
-   `undo_used`
-   `daily_challenge_started`
-   `daily_challenge_completed`
-   `rewarded_ad_offered`
-   `rewarded_ad_completed`
-   `purchase_completed`

Avoid collecting precise location, contacts, unnecessary identifiers or
sensitive personal information.

### Initial internal targets

These are hypotheses for the first test cohort, not guarantees or
universal industry benchmarks.

  Metric                                  Initial target
  ------------------------------------ -----------------
  Tutorial completion                      80% or higher
  Day-1 retention                          20% or higher
  Day-7 retention                           5% or higher
  Crash-free sessions                    99.5% or higher
  Tutorial starters reaching level 5       50% or higher

Do not make strong conclusions from tiny samples. Report cohort size,
date range and measurement method.

### Decision rules

-   Low tutorial completion: simplify the tutorial and first levels.
-   High tutorial completion, low Day-1 return: improve the core loop
    and next-session motivation.
-   Good Day-1, weak Day-7: investigate progression, content and daily
    return reasons.
-   Good retention, weak organic acquisition: improve distribution and
    creative testing.
-   Good retention, weak monetization: test respectful placements and
    value exchange.
-   High ad engagement but falling retention: reduce ad pressure.
-   Persistent weak retention after several meaningful iterations: stop
    scaling and reconsider the game concept.

## 12. Monetization plan

### Stage 1 --- No ads during early prototype

First validate that players enjoy the game. Do not add monetization to
the earliest tests unless it is specifically part of a controlled UX
experiment.

### Stage 2 --- Rewarded advertising

Offer an optional rewarded ad for a clearly disclosed benefit, such as
an additional hint. The player must choose to watch it. The reward must
be delivered reliably.

### Stage 3 --- Interstitial advertising

Use only at natural breaks, such as after a completed level. Avoid ads
during active gameplay, at app launch, immediately after a tap, or in
ways that surprise or mislead the player.

Start conservatively. Measure retention before increasing frequency.

### Stage 4 --- Optional ad-free purchase

Offer a one-time ad-free purchase if users demonstrate demand. Clearly
explain what is removed and what remains available.

### Revenue calculation

Ad revenue estimate:

`Revenue = (Monetized impressions / 1,000) × realized eCPM`

Example volume scenario only:

-   10,000 daily active users.
-   Two monetized impressions per user per day.
-   30 days.

This would produce 600,000 monthly impressions before accounting for
fill, consent, invalid traffic, geography, format mix and actual eCPM.
It is not a revenue forecast.

Track actual proceeds, platform fees, taxes, refunds, payment timing and
operating expenses. Do not confuse estimated revenue with cash received.

## 13. Publishing, legal and privacy checklist

The founder is under 18. Publishing and monetization must be handled
transparently and lawfully.

### Google Play

-   A Play Console account holder must meet Google's age requirement.
-   Current registration fee is US\$25, subject to change.
-   An eligible adult must genuinely take responsibility for the
    publisher account and associated obligations.
-   Do not misrepresent account ownership, developer identity or
    business control.
-   Complete any applicable closed-testing and production-access
    requirements for the account.
-   Confirm current requirements directly in Play Console before
    scheduling launch.

### AdMob and payments

-   AdMob participation requires the account holder to meet Google's age
    requirements.
-   Google's published under-18 arrangement involves a parent or
    guardian applying through their own Google Account, with payments
    issued to that adult.
-   An adult teammate is not automatically eligible to act as a parent
    or guardian.
-   Confirm the exact current account and payment rules before
    integration.
-   Keep written records of who receives payments and how funds are
    accounted for.

### Privacy and user protection

-   Review India's Digital Personal Data Protection Act and applicable
    phased rules.
-   Provide a clear privacy policy and accurate Play Data safety
    disclosures.
-   Review every third-party SDK and its data practices.
-   Collect the minimum data needed.
-   Do not target children or collect children's personal data without
    satisfying applicable requirements.
-   Complete the correct target-audience and content-rating
    declarations.
-   Provide a way to contact the developer.
-   Avoid unnecessary permissions.
-   Ensure ad placements comply with Google Play and advertising
    policies.

### Game design restrictions

Keep AROWGO a conventional free-to-play puzzle game. Do not introduce
entry fees, wagers, deposits, cash prizes or cash-out mechanics. Have
local counsel review any future change that could affect India's online
gaming laws.

### Intellectual property

-   Search exact and similar names in Google Play and Apple App Store.
-   Check relevant domain names and social handles.
-   Search Indian trademark records and relevant international classes
    with qualified advice.
-   Do not assume a name is legally available because a web search
    returns no exact match.
-   Use original art, audio, level layouts and brand assets or properly
    licensed assets.
-   Maintain an asset register with source, license, creator and
    permitted use.

## 14. Budget controls

Initial development should use existing equipment and free or low-cost
tools wherever practical.

  -----------------------------------------------------------------------
  Expense                             Initial policy
  ----------------------------------- -----------------------------------
  Game framework and editor           Use free tooling

  Source control                      Free tier initially

  Prototype hosting                   Free tier if adequate

  Art and audio                       In-house or properly licensed

  Paid advertising                    Zero until retention is validated

  Publishing account                  Budget current official fee through
                                      eligible adult

  Domain                              Purchase only when needed

  Paid SDKs/services                  Require a clear business case
  -----------------------------------------------------------------------

Every expense must be recorded with amount, date, purpose, payer and
approval. Do not use borrowed money or take on recurring costs before
there is evidence of demand.

## 15. Weekly operating cadence

### Daily

-   15--30 minute stand-up.
-   Confirm the day's deliverable.
-   Focused build/test work.
-   Commit code and update issues.
-   Record blockers and decisions.

### Weekly

-   Play the latest build together.
-   Test with people outside the team.
-   Review defects and level difficulty.
-   Review analytics and distribution experiments.
-   Review actual spending.
-   Decide what to build, change or stop.
-   Publish a concise weekly report.

### Weekly report template

``` text
AROWGO — WEEKLY REPORT

Week:
Build version:

1. Shipped
2. Not shipped
3. Critical bugs
4. External testers
5. Tutorial completion
6. Day-1 retention (if measurable)
7. Day-7 retention (if measurable)
8. Distribution posts and results
9. Revenue actually received
10. Expenses
11. Biggest learning
12. Next week's priorities
13. Decisions required
```

## 16. Risk register

  -------------------------------------------------------------------------
  Risk                    Impact                    Mitigation
  ----------------------- ------------------------- -----------------------
  Game feels generic      Low differentiation       Test original mechanics
                                                    and presentation

  Weak retention          No sustainable audience   Improve core loop
                                                    before acquisition

  Poor level quality      Frustration and churn     Automated validation
                                                    plus human playtesting

  Ad overload             Retention damage          Conservative placements
                                                    and cohort tests

  Store approval delays   Launch delay              Start account and
                                                    policy preparation
                                                    early

  Under-18 publishing     Monetization/publishing   Genuine eligible
  restrictions            blocked                   adult/guardian
                                                    arrangements

  Team disagreement       Delivery slows            Written roles,
                                                    ownership and decision
                                                    rules

  Scope creep             MVP never ships           Strict must-ship list

  Asset/IP infringement   Legal and store risk      Original or licensed
                                                    assets; name clearance

  Analytics/privacy       Compliance and trust risk Minimize data, review
  mistakes                                          SDKs and disclosures

  Low organic reach       Few installs              Test creative formats
                                                    and channels
                                                    systematically
  -------------------------------------------------------------------------

## 17. Go / no-go gates

### Gate A --- Prototype

Proceed if: - Core movement works. - Rules are understandable. - Test
levels are solvable. - Logic tests pass.

Otherwise, fix the mechanic before building more content.

### Gate B --- MVP

Proceed to external testing if: - First-session flow works. - Progress
saves correctly. - No critical gameplay bugs remain. - Initial levels
are human-tested.

### Gate C --- Retention

Proceed to monetization experiments if: - A meaningful group of external
players understands the game. - Retention is measurable. - The team can
identify why players return or leave. - Privacy and platform
requirements are reviewed.

### Gate D --- Scale

Consider paid acquisition or a second game only if: - Retention is
stable across more than one cohort. - Monetization does not materially
damage retention. - Revenue and costs are measured accurately. - The
team can support the product operationally.

If a gate fails, revise or stop. Do not scale simply because development
time has already been spent.

## 18. First-day execution checklist

**Target date: 9 November 2026**

Suggested six-hour founder workday:

  -----------------------------------------------------------------------
  Time                                Task
  ----------------------------------- -----------------------------------
  09:00--09:30                        Confirm roles, responsibilities and
                                      ownership documentation

  09:30--10:00                        Create repository, project board
                                      and team access

  10:00--11:30                        Initialize Phaser, TypeScript and
                                      Vite; render a grid

  11:30--13:00                        Implement arrow entities and
                                      directional path checks

  14:00--15:00                        Implement touch input and
                                      valid/blocked movement

  15:00--16:00                        Create three test levels and verify
                                      win condition
  -----------------------------------------------------------------------

### Day-one acceptance criteria

-   App opens in a browser.
-   Grid renders.
-   Arrow tiles appear in correct positions.
-   Player can select an arrow.
-   Clear arrows exit the board.
-   Blocked arrows remain.
-   Clearing all arrows triggers victory exactly once.
-   Three test levels work.
-   Code is committed to GitHub.
-   All contributors can run the project locally.

No ads, login, cloud backend or elaborate marketing site on day one.

## 19. Definition of success

The first success is not merely publishing an app.

The product must demonstrate:

1.  People outside the team choose to play.
2.  They understand the rules without live developer explanation.
3.  A meaningful subset returns.
4.  The game can acquire users through repeatable channels.
5.  Monetization can be introduced without ruining the experience.
6.  Revenue is real, documented and received through a compliant
    arrangement.

### Business milestones

  -----------------------------------------------------------------------
  Milestone                           Meaning
  ----------------------------------- -----------------------------------
  First genuine ₹100                  First evidence of paid demand or
                                      monetization

  ₹1,000 monthly revenue              Early monetization signal

  ₹10,000 monthly revenue             Stronger evidence worth
                                      investigating

  Sustainable positive contribution   Revenue exceeds attributable
                                      operating costs

  BMW acquisition fund                Separate long-term savings goal,
                                      not a business expense
  -----------------------------------------------------------------------

These are goals, not promised outcomes or deadlines.

## 20. Founder operating principles

-   Ship small, test with real users, iterate.
-   Do not confuse coding speed with business progress.
-   Do not confuse views or downloads with retained users.
-   Do not confuse estimated ad revenue with cash received.
-   Do not add features to avoid distribution work.
-   Do not increase ad frequency just to improve a short-term metric.
-   Do not copy another game's protected assets or identity.
-   Do not spend heavily before validating retention.
-   Keep team agreements, accounts and finances transparent.
-   Protect education, health and sustainable working hours.

------------------------------------------------------------------------

## Final direction

**AROWGO is the first experiment in building a repeatable mobile-game
business.**

The immediate objective is a small, original, polished puzzle game. The
next objective is evidence of retention. Only then do we optimize
monetization and distribution.

The long-term objective is not to own one app. It is to build the
capability to repeatedly identify, create, distribute and operate
products that people genuinely want.

**Build → Test → Retain → Monetize → Distribute → Scale.**

The first proof is a stranger coming back to play tomorrow.
