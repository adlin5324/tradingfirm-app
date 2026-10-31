// Single source of truth for the comparison. Edit scores here; places, ranks, averages, the leaderboard and the numbers
// in the {tokens} below all follow. Scores: 5 = same as Adlin's Investments, 0-4 weaker, 6-10 better.
// Text tokens: {n} contenders, {n6} repo categories scoring 6+, {place:Group} and {avg:Group} for a repo (or Adlin's Investments' place),
// {score:Category} for a repo, {rank:Category} and {bestrank} for Adlin's Investments.
window.DATA = {
 "me": {
  "name": "Adlin’s Investments",
  "desc": "A private trading bot for a cash brokerage account that runs once a day on GitHub. It follows a fixed rules file, and every job is done by a separate role: a rule checker, strategies that vote on stocks, risk and portfolio sizing, backtesting, a bookkeeper, and daily reports. AI agents only advise, flag or halt, and they never place orders.",
  "lacks": [
   "Behind in every group of {n}: {place:Trading} in Trading, {place:Research} in Research, {place:AI} in AI, {place:Using it} in Using it, and {place:Trust and upkeep} in Trust and upkeep. Its best rank in any single category is {bestrank}.",
   "Narrow reach: one broker and stocks only, with no ETFs, so it is {rank:Broker and exchange support} of {n} on broker support and {rank:Markets covered} on markets covered. NautilusTrader has adapters for more than 15 venues, Fincept about 25 brokers, Freqtrade about 21 exchanges and Vibe Trading about nine.",
   "Thin data: {rank:Data sources} of {n} on data sources, with price history and SEC filings only. Vibe Trading has about 45 data loaders, TradingAgents pulls from Yahoo Finance, Alpha Vantage, FRED, Reddit, StockTwits and EDGAR, and Fincept has many more feeds.",
   "Small toolkit: {rank:Technical indicators} on technical indicators and {rank:Strategy variety} on strategy variety, with ten rule-based strategies against Jesse's 300+ indicators, Freqtrade's TA-Lib library and hyperopt, and Vibe Trading's 91 skills and 30 swarm presets.",
   "Mid-pack trading engine: {rank:Real trading} on real trading, {rank:Backtesting} on backtesting, {rank:Practice mode} on practice mode and {rank:Risk controls} on risk controls. NautilusTrader, Freqtrade, Jesse and Vibe Trading all ship mature backtesting, paper or sandbox modes and order or drawdown protections.",
   "Hard to set up and learn: {rank:Ease of setup} on ease of setup and {rank:Docs and community} on docs and community. It needs a broker login, GitHub secrets and many workflows, with a README and roadmap as the only docs, one owner and no outside community.",
   "Unproven and fragile: {rank:Maturity} on maturity, {rank:Update frequency} on update frequency and {rank:Testing and code quality} on testing, with 152 tests against Freqtrade's 1,619 and over 1,000 test files in Vibe Trading. It also depends on GitHub's free Actions minutes, and its schedules were paused when they ran out.",
   "Less capable AI: {rank:AI and ML depth} on AI depth and {rank:Reports and explanations} on reports. The agents only advise, with far fewer tools, data sources and models than Vibe Trading (96 tools) or TradingAgents, and plainer reports than either.",
   "Small interface: {rank:Dashboard and control} on dashboard and {rank:Mobile and remote access} on phone and remote access, with a phone dashboard and halt and sell buttons, against Fincept's 57 screens, OctoBot's web, mobile and Telegram control, Freqtrade's Telegram, Discord and web control, and Vibe Trading's web app, desktop app and chat channels.",
   "Not even best at its own focus: it is {rank:Fits stock trading} of {n} on stock trading fit, and several repos here score higher for stocks."
  ]
 },
 "groups": [
  {
   "name": "Trading",
   "cats": [
    [
     "Real trading",
     "Sends real buy and sell orders to a broker with real money. High means it can place and manage live orders end to end. Low means it only analyzes, or only suggests."
    ],
    [
     "Backtesting",
     "Replays a strategy on past prices to estimate how it would have done. High means testing over years of data with realistic details like stops and costs. Low means no testing tools at all."
    ],
    [
     "Practice mode",
     "Lets you try it with fake money or a dry run before risking real money. High means a built-in paper or dry-run mode that behaves like the real thing. Low means you must go live to see how it acts."
    ],
    [
     "Risk controls",
     "Hard limits that block bad trades, such as a daily loss limit, no margin or shorting, and an approval check before every order. High means rules that cannot be skipped. Low means no checks, or checks the software itself can override."
    ],
    [
     "Broker and exchange support",
     "How many brokers or exchanges it can connect to. High means many choices and easy switching. Low means one connection, or none."
    ],
    [
     "Position sizing",
     "Decides how many shares or coins to buy for each trade based on your cash and the risk. High means automatic sizing tied to your balance and limits. Low means you pick every amount by hand."
    ],
    [
     "Markets covered",
     "How many kinds of markets it works with, such as stocks, crypto, futures and options. High means many markets in one tool. Low means a single market."
    ],
    [
     "Fits stock trading",
     "How well it works for plain stocks specifically, since your bot trades a cash stock account. High means stocks are a main target. Low means built for something else, like crypto only."
    ]
   ]
  },
  {
   "name": "Research",
   "cats": [
    [
     "Strategy variety",
     "How many different trading approaches it has built in or ready to use, such as trend, momentum and mean reversion. High means many working approaches you can pick from. Low means one idea or none."
    ],
    [
     "Strategy optimization",
     "Automatically tunes or evolves strategies instead of you trying settings by hand. High means built-in search and tuning with safeguards against overfitting. Low means manual tuning only."
    ],
    [
     "Data sources",
     "How much price, news and company data it can pull in. High means many sources that are cleaned and checked. Low means you must bring all your own data."
    ],
    [
     "Fundamentals and filings",
     "Reads company financial statements and official filings, such as quarterly results or insider buying. High means it uses them in decisions. Low means price charts only."
    ],
    [
     "News and sentiment",
     "Reads news and public mood about a stock. High means it scores news and social sentiment and uses it. Low means it ignores both."
    ],
    [
     "Technical indicators",
     "Math on price and volume, such as moving averages, RSI and MACD. High means a wide library you can combine freely. Low means a few basics or none."
    ],
    [
     "Performance tracking",
     "Tracks how the account is doing against a benchmark over time. High means a scorecard of growth and profit, ideally compared with the market. Low means no running record."
    ]
   ]
  },
  {
   "name": "AI",
   "cats": [
    [
     "AI and ML depth",
     "How much AI agents or machine learning it uses, and how much they decide. High means several AI roles or trained models doing real work. Low means no AI."
    ],
    [
     "AI safety limits",
     "Keeps AI from doing damage, for example AI that only advises and can never place an order or change limits. High means AI is fenced in by fixed rules. Low means AI output can drive trades directly. Tools with no AI score even."
    ],
    [
     "Reports and explanations",
     "Writes down what it did and why, in a form you can read. High means clear reports that show the reasoning behind each decision. Low means raw numbers or logs only."
    ],
    [
     "Alerts and notifications",
     "Sends you messages when something happens, such as an order, an error or a halt. High means phone or chat alerts for the events that matter. Low means you have to go look."
    ]
   ]
  },
  {
   "name": "Using it",
   "cats": [
    [
     "Dashboard and control",
     "A screen you can open to watch results and control it. High means a polished interface for both. Low means command line or code only."
    ],
    [
     "Mobile and remote access",
     "Whether you can check and control it from your phone or away from your computer. High means a phone-friendly app or a chat bot. Low means you must be at one machine."
    ],
    [
     "Automated daily run",
     "Runs on its own every day without you starting it. High means a schedule that keeps going by itself. Low means you start every run by hand."
    ],
    [
     "Emergency controls",
     "A fast way to stop trading or sell positions when something looks wrong. High means a clear halt and sell option that works at once. Low means you must stop the program yourself."
    ],
    [
     "Ease of setup",
     "How quickly you can install it and get a first result. High means minutes with few steps. Low means many accounts, keys and settings first."
    ],
    [
     "Running cost",
     "What it costs to keep running, such as servers, paid data and AI usage. High means cheap or free to run. Low means ongoing bills or a machine on all the time."
    ]
   ]
  },
  {
   "name": "Trust and upkeep",
   "cats": [
    [
     "Docs and community",
     "Quality of guides and how many active users and contributors can help. High means thorough docs and a large, helpful community. Low means a bare README and few users."
    ],
    [
     "Maturity",
     "How tested, stable and proven it is. High means years of real use and few surprises. Early versions score low."
    ],
    [
     "Testing and code quality",
     "Automatic tests and review that catch mistakes before they reach you. High means broad tests that run on every change. Low means little or no testing."
    ],
    [
     "Update frequency",
     "How often it gets fixes and new features. High means regular releases. Low means stale or abandoned."
    ],
    [
     "Customizability",
     "How easily you can change it to fit your own rules and ideas. High means clear settings and room to add your own pieces. Low means fixed behavior."
    ]
   ]
  }
 ],
 "repos": [
  {
   "nav": "Awesome Systematic Trading",
   "url": "https://github.com/paperswithbacktest/awesome-systematic-trading",
   "desc": "A map of everything that exists for systematic (quant) trading: backtesting and live-trading frameworks, trading bots, indicators, risk and optimization tools, broker APIs, data sources, papers and books. Start here to see what's already built before building your own.",
   "summary": "Awesome Systematic Trading is a reading list, not software, so it can't trade, test or run anything. It points to a huge range of ideas, brokers, markets and data sources ({score:Strategy variety}/10 on strategy variety, {score:Data sources}/10 on data) and is easy to start with, but it does nothing itself: {score:Real trading}/10 on real trading, {score:Practice mode}/10 on practice mode and {score:Dashboard and control}/10 on a dashboard. Places out of {n}: {place:Trading} in Trading, {place:Research} in Research, {place:AI} in AI, {place:Using it} in Using it and {place:Trust and upkeep} in Trust and upkeep. Use it to find tools and ideas, not to run money.",
   "scores": {
    "Real trading": 0,
    "Backtesting": 1,
    "Practice mode": 0,
    "Risk controls": 0,
    "Broker and exchange support": 9,
    "Position sizing": 1,
    "Markets covered": 9,
    "Fits stock trading": 6,
    "Strategy variety": 9,
    "Strategy optimization": 2,
    "Data sources": 9,
    "Fundamentals and filings": 3,
    "News and sentiment": 2,
    "Technical indicators": 8,
    "Performance tracking": 0,
    "AI and ML depth": 0,
    "AI safety limits": 5,
    "Reports and explanations": 2,
    "Alerts and notifications": 0,
    "Dashboard and control": 0,
    "Mobile and remote access": 6,
    "Automated daily run": 0,
    "Emergency controls": 0,
    "Ease of setup": 9,
    "Running cost": 9,
    "Docs and community": 8,
    "Maturity": 7,
    "Testing and code quality": 4,
    "Update frequency": 6,
    "Customizability": 1
   }
  },
  {
   "nav": "Fincept Terminal",
   "url": "https://github.com/Fincept-Corporation/FinceptTerminal",
   "desc": "A native C++20 desktop terminal for financial research, built on Qt6 with embedded Python 3.11 and shipped as one binary with no Electron. It packs about 41 modules across six desks: agentic research, quant lab and backtesting, fundamentals, markets and execution, macro, and a personal workspace. The open build is AGPL-3.0, and a paid Enterprise edition also exists.",
   "summary": "Fincept Terminal is a far bigger product than Adlin's Investments: a desktop app with 57 screens, about 25 broker adapters, paper trading, a backtest engine, news, fundamentals and filings, and AI research tools. Places out of {n}: {place:Trading} in Trading, {place:Research} in Research, {place:AI} in AI, {place:Using it} in Using it and {place:Trust and upkeep} in Trust and upkeep, with a score of 6 or higher in {n6} of 30 categories. It is weak on strategy optimization ({score:Strategy optimization}), AI safety limits ({score:AI safety limits}), phone access ({score:Mobile and remote access}) and emergency stops ({score:Emergency controls}), and its README lists managed live routing, private data and multi-agent research as paid Enterprise features under an AGPL licence.",
   "scores": {
    "Real trading": 7,
    "Backtesting": 7,
    "Practice mode": 8,
    "Risk controls": 5,
    "Broker and exchange support": 9,
    "Position sizing": 5,
    "Markets covered": 9,
    "Fits stock trading": 7,
    "Strategy variety": 6,
    "Strategy optimization": 4,
    "Data sources": 8,
    "Fundamentals and filings": 8,
    "News and sentiment": 7,
    "Technical indicators": 8,
    "Performance tracking": 7,
    "AI and ML depth": 8,
    "AI safety limits": 4,
    "Reports and explanations": 7,
    "Alerts and notifications": 7,
    "Dashboard and control": 9,
    "Mobile and remote access": 3,
    "Automated daily run": 6,
    "Emergency controls": 3,
    "Ease of setup": 8,
    "Running cost": 6,
    "Docs and community": 7,
    "Maturity": 7,
    "Testing and code quality": 6,
    "Update frequency": 8,
    "Customizability": 5
   }
  },
  {
   "nav": "Freqtrade",
   "url": "https://github.com/freqtrade/freqtrade",
   "desc": "A free, open-source crypto trading bot written in Python. It covers backtesting, strategy optimization and FreqAI machine-learning models, and you control it through Telegram or a built-in web UI. Run it in dry-run mode first, since the authors state it is for educational use and take no responsibility for losses. GPL-3.0.",
   "summary": "Freqtrade is one of the most proven trading bots here: about 21 exchanges (spot and futures), backtesting plus hyperopt tuning, a dry-run mode, protections such as a max-drawdown and stop-loss guard, 15 FreqAI model types, Telegram, Discord and web control, and more than 1,600 automated tests. Places out of {n}: {place:Trading} in Trading, {place:Research} in Research, {place:AI} in AI, {place:Using it} in Using it and {place:Trust and upkeep} in Trust and upkeep ({avg:Trust and upkeep} average). Its misses are the market and the research: it is a crypto bot that does not fit your stock cash account (markets {score:Markets covered}, stock fit {score:Fits stock trading}), and it has no news, sentiment or filings analysis ({score:News and sentiment} and {score:Fundamentals and filings}).",
   "scores": {
    "Real trading": 8,
    "Backtesting": 9,
    "Practice mode": 9,
    "Risk controls": 8,
    "Broker and exchange support": 8,
    "Position sizing": 8,
    "Markets covered": 3,
    "Fits stock trading": 1,
    "Strategy variety": 5,
    "Strategy optimization": 9,
    "Data sources": 5,
    "Fundamentals and filings": 1,
    "News and sentiment": 1,
    "Technical indicators": 9,
    "Performance tracking": 9,
    "AI and ML depth": 7,
    "AI safety limits": 5,
    "Reports and explanations": 7,
    "Alerts and notifications": 9,
    "Dashboard and control": 8,
    "Mobile and remote access": 8,
    "Automated daily run": 8,
    "Emergency controls": 8,
    "Ease of setup": 6,
    "Running cost": 5,
    "Docs and community": 10,
    "Maturity": 10,
    "Testing and code quality": 10,
    "Update frequency": 9,
    "Customizability": 9
   }
  },
  {
   "nav": "TradingAgents",
   "url": "https://github.com/TauricResearch/TradingAgents",
   "desc": "A multi-agent LLM framework from Tauric Research that mirrors a real trading firm. Analysts (fundamentals, sentiment, news, technical) feed researchers, a trader and risk and portfolio managers who debate toward a decision. It has a CLI and a Python package, and it is built for research, not financial advice.",
   "summary": "TradingAgents is a research framework, not a trading bot. It is strongest on AI depth ({score:AI and ML depth}) and news and sentiment ({score:News and sentiment}), with data sources ({score:Data sources}), fundamentals ({score:Fundamentals and filings}) and reports ({score:Reports and explanations}) close behind. Operationally it is far behind: no broker connection ({score:Broker and exchange support}), no alerts ({score:Alerts and notifications}), no emergency controls ({score:Emergency controls}), a thin dashboard ({score:Dashboard and control}) and an LLM bill on every run. Places out of {n}: {place:Trading} in Trading, {place:Research} in Research, {place:AI} in AI, {place:Using it} in Using it and {place:Trust and upkeep} in Trust and upkeep. Its README says it is for research and that results vary by model and data.",
   "scores": {
    "Real trading": 1,
    "Backtesting": 4,
    "Practice mode": 3,
    "Risk controls": 3,
    "Broker and exchange support": 1,
    "Position sizing": 3,
    "Markets covered": 6,
    "Fits stock trading": 7,
    "Strategy variety": 2,
    "Strategy optimization": 2,
    "Data sources": 8,
    "Fundamentals and filings": 8,
    "News and sentiment": 9,
    "Technical indicators": 6,
    "Performance tracking": 6,
    "AI and ML depth": 9,
    "AI safety limits": 4,
    "Reports and explanations": 8,
    "Alerts and notifications": 0,
    "Dashboard and control": 2,
    "Mobile and remote access": 1,
    "Automated daily run": 4,
    "Emergency controls": 0,
    "Ease of setup": 5,
    "Running cost": 3,
    "Docs and community": 7,
    "Maturity": 6,
    "Testing and code quality": 6,
    "Update frequency": 8,
    "Customizability": 8
   }
  },
  {
   "nav": "Vibe Trading",
   "url": "https://github.com/HKUDS/Vibe-Trading",
   "desc": "A personal trading agent from HKUDS with a CLI, a FastAPI web server and an MCP server, so it works with clients like Claude Desktop and Cursor. It runs multi-agent swarm workflows and backtesting across markets. You bring your own LLM API key, and it installs with Docker or from PyPI as vibe-trading-ai.",
   "summary": "Vibe Trading is far larger than a typical AI agent project. It has about 45 data loaders, backtest engines for stocks, crypto, futures, forex and options in many countries, paper trading, connections to brokers such as Interactive Brokers, Alpaca, Futu and Robinhood, an order guard with a halt switch, chat alerts on many apps, a web frontend, 91 skills, 30 agent swarm presets and over 1,000 test files. Places out of {n}: {place:Trading} in Trading, {place:Research} in Research, {place:AI} in AI, {place:Using it} in Using it and {place:Trust and upkeep} in Trust and upkeep, with a score of 6 or higher in {n6} of 30 categories. Its low points are running cost ({score:Running cost}), version 0.1.x and a long setup.",
   "scores": {
    "Real trading": 8,
    "Backtesting": 9,
    "Practice mode": 8,
    "Risk controls": 8,
    "Broker and exchange support": 9,
    "Position sizing": 8,
    "Markets covered": 10,
    "Fits stock trading": 8,
    "Strategy variety": 9,
    "Strategy optimization": 7,
    "Data sources": 10,
    "Fundamentals and filings": 9,
    "News and sentiment": 7,
    "Technical indicators": 9,
    "Performance tracking": 8,
    "AI and ML depth": 9,
    "AI safety limits": 8,
    "Reports and explanations": 9,
    "Alerts and notifications": 9,
    "Dashboard and control": 9,
    "Mobile and remote access": 8,
    "Automated daily run": 8,
    "Emergency controls": 7,
    "Ease of setup": 6,
    "Running cost": 4,
    "Docs and community": 9,
    "Maturity": 6,
    "Testing and code quality": 9,
    "Update frequency": 10,
    "Customizability": 9
   }
  },
  {
   "nav": "Jesse",
   "url": "https://github.com/jesse-ai/jesse",
   "desc": "An open-source Python framework for researching, backtesting, optimizing and live trading your own crypto strategies. It has 300+ indicators, Optuna-based optimization, Monte Carlo and significance tests, paper trading, Telegram, Slack and Discord alerts, a built-in code editor and an MCP server for AI assistants. MIT licence.",
   "summary": "Jesse is a Python framework built for researching and backtesting your own crypto strategies, with more than 300 indicators, Optuna-based optimization, Monte Carlo and significance tests, paper and live trading, chat alerts and an MCP server. Its best scores are technical indicators ({score:Technical indicators}), strategy optimization ({score:Strategy optimization}) and performance metrics ({score:Performance tracking}). It trades crypto only, so stock fit is {score:Fits stock trading}, and it has no news, sentiment or filings analysis. Places out of {n}: {place:Trading} in Trading, {place:Research} in Research, {place:AI} in AI, {place:Using it} in Using it and {place:Trust and upkeep} in Trust and upkeep.",
   "scores": {
    "Real trading": 6,
    "Backtesting": 9,
    "Practice mode": 8,
    "Risk controls": 6,
    "Broker and exchange support": 5,
    "Position sizing": 6,
    "Markets covered": 3,
    "Fits stock trading": 1,
    "Strategy variety": 4,
    "Strategy optimization": 9,
    "Data sources": 4,
    "Fundamentals and filings": 1,
    "News and sentiment": 1,
    "Technical indicators": 10,
    "Performance tracking": 9,
    "AI and ML depth": 5,
    "AI safety limits": 5,
    "Reports and explanations": 7,
    "Alerts and notifications": 8,
    "Dashboard and control": 8,
    "Mobile and remote access": 5,
    "Automated daily run": 7,
    "Emergency controls": 6,
    "Ease of setup": 7,
    "Running cost": 5,
    "Docs and community": 7,
    "Maturity": 7,
    "Testing and code quality": 7,
    "Update frequency": 9,
    "Customizability": 9
   }
  },
  {
   "nav": "OctoBot",
   "url": "https://github.com/Drakkar-Software/OctoBot",
   "desc": "A free, open-source crypto trading bot with a visual web interface. It supports grid, DCA and crypto-basket strategies, AI connectors for OpenAI and Ollama models, TradingView automation, Telegram control, backtesting and 15+ exchanges. The current 3.0 beta runs in a new node mode. GPL-3.0.",
   "summary": "OctoBot is a crypto trading bot with a visual web interface, grid, DCA and basket strategies, TradingView automation, OpenAI and Ollama connectors, Telegram control, backtesting, 15+ exchanges and a large test suite. It is easy to start ({score:Ease of setup} on setup) and has news and sentiment tools ({score:News and sentiment}). Places out of {n}: {place:Trading} in Trading, {place:Research} in Research, {place:AI} in AI, {place:Using it} in Using it and {place:Trust and upkeep} in Trust and upkeep. It is crypto only (stock fit {score:Fits stock trading}), and the 3.0 beta is a large rewrite that is still settling.",
   "scores": {
    "Real trading": 8,
    "Backtesting": 7,
    "Practice mode": 8,
    "Risk controls": 5,
    "Broker and exchange support": 7,
    "Position sizing": 6,
    "Markets covered": 3,
    "Fits stock trading": 1,
    "Strategy variety": 8,
    "Strategy optimization": 5,
    "Data sources": 5,
    "Fundamentals and filings": 1,
    "News and sentiment": 7,
    "Technical indicators": 8,
    "Performance tracking": 7,
    "AI and ML depth": 6,
    "AI safety limits": 5,
    "Reports and explanations": 5,
    "Alerts and notifications": 7,
    "Dashboard and control": 9,
    "Mobile and remote access": 8,
    "Automated daily run": 8,
    "Emergency controls": 6,
    "Ease of setup": 8,
    "Running cost": 5,
    "Docs and community": 8,
    "Maturity": 7,
    "Testing and code quality": 8,
    "Update frequency": 6,
    "Customizability": 8
   }
  },
  {
   "nav": "NautilusTrader",
   "url": "https://github.com/nautechsystems/nautilus_trader",
   "desc": "A production-grade, Rust-native trading engine with a Python control plane for multi-asset, multi-venue systems. The same strategy code runs in deterministic backtests and live, through adapters for Binance, Bybit, Coinbase, Interactive Brokers, Databento and more. LGPL-3.0.",
   "summary": "NautilusTrader is a Rust-native engine for professional multi-asset, multi-venue trading, with adapters for Binance, Bybit, Coinbase, Interactive Brokers, Databento and others, deterministic backtests and live trading from the same strategy code, a risk engine and a sandbox mode. It covers the most markets ({score:Markets covered}) and scores {score:Testing and code quality} on testing and {score:Docs and community} on docs. Places out of {n}: {place:Trading} in Trading, {place:Research} in Research, {place:AI} in AI, {place:Using it} in Using it and {place:Trust and upkeep} in Trust and upkeep. Its weak side is everyday use: no built-in dashboard ({score:Dashboard and control}), no phone access ({score:Mobile and remote access}), almost no AI ({score:AI and ML depth}), a steep setup ({score:Ease of setup}) and no news or filings analysis.",
   "scores": {
    "Real trading": 9,
    "Backtesting": 10,
    "Practice mode": 9,
    "Risk controls": 9,
    "Broker and exchange support": 8,
    "Position sizing": 8,
    "Markets covered": 10,
    "Fits stock trading": 7,
    "Strategy variety": 5,
    "Strategy optimization": 3,
    "Data sources": 8,
    "Fundamentals and filings": 1,
    "News and sentiment": 1,
    "Technical indicators": 8,
    "Performance tracking": 9,
    "AI and ML depth": 2,
    "AI safety limits": 5,
    "Reports and explanations": 7,
    "Alerts and notifications": 4,
    "Dashboard and control": 3,
    "Mobile and remote access": 2,
    "Automated daily run": 7,
    "Emergency controls": 7,
    "Ease of setup": 3,
    "Running cost": 5,
    "Docs and community": 9,
    "Maturity": 8,
    "Testing and code quality": 10,
    "Update frequency": 10,
    "Customizability": 10
   }
  },
  {
   "nav": "Backtrader",
   "url": "https://github.com/mementum/backtrader",
   "desc": "A long-standing Python backtesting library with dozens of indicators, analyzers, sizers, plotting, and live connections to Interactive Brokers and Oanda. Its last commit was in April 2023, so it is no longer updated. GPL-3.0.",
   "summary": "Backtrader is an older Python backtesting library with dozens of indicators, analyzers, sizers, plotting and live connections to Interactive Brokers and Oanda. It has had no commit since April 2023, so update frequency scores {score:Update frequency}. It handles stocks and other markets through its data feeds, but it has no AI ({score:AI and ML depth}), no alerts ({score:Alerts and notifications}), no dashboard beyond charts ({score:Dashboard and control}) and no emergency controls ({score:Emergency controls}). Places out of {n}: {place:Trading} in Trading, {place:Research} in Research, {place:AI} in AI, {place:Using it} in Using it and {place:Trust and upkeep} in Trust and upkeep.",
   "scores": {
    "Real trading": 5,
    "Backtesting": 8,
    "Practice mode": 5,
    "Risk controls": 3,
    "Broker and exchange support": 3,
    "Position sizing": 6,
    "Markets covered": 6,
    "Fits stock trading": 7,
    "Strategy variety": 3,
    "Strategy optimization": 6,
    "Data sources": 5,
    "Fundamentals and filings": 0,
    "News and sentiment": 0,
    "Technical indicators": 9,
    "Performance tracking": 8,
    "AI and ML depth": 0,
    "AI safety limits": 5,
    "Reports and explanations": 5,
    "Alerts and notifications": 0,
    "Dashboard and control": 2,
    "Mobile and remote access": 0,
    "Automated daily run": 3,
    "Emergency controls": 1,
    "Ease of setup": 6,
    "Running cost": 8,
    "Docs and community": 7,
    "Maturity": 8,
    "Testing and code quality": 5,
    "Update frequency": 1,
    "Customizability": 8
   }
  }
 ]
};
