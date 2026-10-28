import { BlockChallenge, CodeChallenge, RefactorChallenge } from './arena.models';

export const BLOCK_CHALLENGES: Record<string, BlockChallenge> = {
  'factory-method': {
    patternId: 'factory-method',
    brief: {
      en: 'Assemble Creator → Product. Concrete creator decides which product to instantiate.',
      fa: 'ساختار Creator → Product را بچینید. Creator مشخص تصمیم می‌گیرد کدام محصول ساخته شود.',
    },
    pieces: [
      {
        id: 'creator',
        label: { en: 'Creator', fa: 'Creator' },
        hint: { en: 'Declares factoryMethod()', fa: 'متد factoryMethod را اعلام می‌کند' },
      },
      {
        id: 'concrete-creator',
        label: { en: 'ConcreteCreator', fa: 'ConcreteCreator' },
        hint: { en: 'Overrides factoryMethod()', fa: 'factoryMethod را بازنویسی می‌کند' },
      },
      {
        id: 'product',
        label: { en: 'Product', fa: 'Product' },
        hint: { en: 'Interface the client depends on', fa: 'اینترفیسی که کلاینت به آن وابسته است' },
      },
      {
        id: 'concrete-product',
        label: { en: 'ConcreteProduct', fa: 'ConcreteProduct' },
        hint: { en: 'The real object returned', fa: 'شیء واقعی برگشتی' },
      },
      {
        id: 'singleton',
        label: { en: 'Singleton', fa: 'Singleton' },
        hint: { en: 'Distractor — not part of this pattern', fa: 'گمراه‌کننده — جزء این الگو نیست' },
        distractor: true,
      },
    ],
    requiredPieceIds: ['creator', 'concrete-creator', 'product', 'concrete-product'],
    expectedEdges: [
      { from: 'concrete-creator', to: 'creator', relation: 'extends' },
      { from: 'concrete-product', to: 'product', relation: 'implements' },
      { from: 'concrete-creator', to: 'concrete-product', relation: 'creates' },
    ],
    relations: ['extends', 'implements', 'creates'],
    animation: [
      {
        pieceIds: ['creator'],
        message: {
          en: 'Client calls Creator.factoryMethod() without knowing the concrete type.',
          fa: 'کلاینت Creator.factoryMethod را صدا می‌زند بدون دانستن نوع مشخص.',
        },
      },
      {
        pieceIds: ['concrete-creator'],
        message: {
          en: 'ConcreteCreator overrides the hook and chooses the product class.',
          fa: 'ConcreteCreator هوک را بازنویسی می‌کند و کلاس محصول را انتخاب می‌کند.',
        },
      },
      {
        pieceIds: ['concrete-creator', 'concrete-product'],
        message: {
          en: 'new ConcreteProduct() — creation is localized in one place.',
          fa: 'new ConcreteProduct() — ساخت در یک نقطه متمرکز است.',
        },
      },
      {
        pieceIds: ['product', 'concrete-product'],
        message: {
          en: 'Returned as Product. Client stays decoupled from concrete classes.',
          fa: 'به‌صورت Product برمی‌گردد. کلاینت از کلاس‌های مشخص جدا می‌ماند.',
        },
      },
    ],
  },
  adapter: {
    patternId: 'adapter',
    brief: {
      en: 'Wrap an Adaptee so a Client can talk to the Target interface it expects.',
      fa: 'Adaptee را بپیچید تا Client با اینترفیس Target مورد انتظار حرف بزند.',
    },
    pieces: [
      {
        id: 'target',
        label: { en: 'Target', fa: 'Target' },
        hint: { en: 'Interface the client expects', fa: 'اینترفیس مورد انتظار کلاینت' },
      },
      {
        id: 'adapter',
        label: { en: 'Adapter', fa: 'Adapter' },
        hint: { en: 'Translates Target → Adaptee', fa: 'Target را به Adaptee ترجمه می‌کند' },
      },
      {
        id: 'adaptee',
        label: { en: 'Adaptee', fa: 'Adaptee' },
        hint: { en: 'Existing incompatible API', fa: 'API ناسازگار موجود' },
      },
      {
        id: 'client',
        label: { en: 'Client', fa: 'Client' },
        hint: { en: 'Depends only on Target', fa: 'فقط به Target وابسته است' },
      },
      {
        id: 'facade',
        label: { en: 'Facade', fa: 'Facade' },
        hint: { en: 'Distractor — different intent', fa: 'گمراه‌کننده — نیت متفاوت' },
        distractor: true,
      },
    ],
    requiredPieceIds: ['target', 'adapter', 'adaptee', 'client'],
    expectedEdges: [
      { from: 'adapter', to: 'target', relation: 'implements' },
      { from: 'adapter', to: 'adaptee', relation: 'wraps' },
      { from: 'client', to: 'target', relation: 'uses' },
    ],
    relations: ['implements', 'wraps', 'uses'],
    animation: [
      {
        pieceIds: ['client', 'target'],
        message: {
          en: 'Client calls Target.request() — the only contract it knows.',
          fa: 'Client متد Target.request را صدا می‌زند — تنها قراردادی که می‌شناسد.',
        },
      },
      {
        pieceIds: ['adapter'],
        message: {
          en: 'Adapter receives the call and maps it to the legacy shape.',
          fa: 'Adapter فراخوانی را می‌گیرد و به شکل قدیمی نگاشت می‌کند.',
        },
      },
      {
        pieceIds: ['adapter', 'adaptee'],
        message: {
          en: 'Adaptee.specificRequest() runs. Legacy code stays untouched.',
          fa: 'Adaptee.specificRequest اجرا می‌شود. کد قدیمی دست‌نخورده می‌ماند.',
        },
      },
      {
        pieceIds: ['client', 'adapter', 'adaptee'],
        message: {
          en: 'Result flows back through the Adapter. Client never saw the mismatch.',
          fa: 'نتیجه از Adapter برمی‌گردد. Client ناسازگاری را ندید.',
        },
      },
    ],
  },
  observer: {
    patternId: 'observer',
    brief: {
      en: 'Wire a Subject that notifies multiple Observers when state changes.',
      fa: 'Subject را طوری وصل کنید که با تغییر وضعیت، چند Observer را مطلع کند.',
    },
    pieces: [
      {
        id: 'subject',
        label: { en: 'Subject', fa: 'Subject' },
        hint: { en: 'Attach / detach / notify', fa: 'اتصال / قطع / اطلاع' },
      },
      {
        id: 'concrete-subject',
        label: { en: 'ConcreteSubject', fa: 'ConcreteSubject' },
        hint: { en: 'Holds state + notify()', fa: 'وضعیت را نگه می‌دارد و notify می‌کند' },
      },
      {
        id: 'observer',
        label: { en: 'Observer', fa: 'Observer' },
        hint: { en: 'update() contract', fa: 'قرارداد update' },
      },
      {
        id: 'observer-a',
        label: { en: 'ObserverA', fa: 'ObserverA' },
        hint: { en: 'First subscriber', fa: 'اولین مشترک' },
      },
      {
        id: 'observer-b',
        label: { en: 'ObserverB', fa: 'ObserverB' },
        hint: { en: 'Second subscriber', fa: 'دومین مشترک' },
      },
      {
        id: 'mediator',
        label: { en: 'Mediator', fa: 'Mediator' },
        hint: { en: 'Distractor — centralizes dialogue differently', fa: 'گمراه‌کننده — گفتگو را طور دیگر متمرکز می‌کند' },
        distractor: true,
      },
    ],
    requiredPieceIds: ['subject', 'concrete-subject', 'observer', 'observer-a', 'observer-b'],
    expectedEdges: [
      { from: 'concrete-subject', to: 'subject', relation: 'extends' },
      { from: 'observer-a', to: 'observer', relation: 'implements' },
      { from: 'observer-b', to: 'observer', relation: 'implements' },
      { from: 'concrete-subject', to: 'observer-a', relation: 'notifies' },
      { from: 'concrete-subject', to: 'observer-b', relation: 'notifies' },
    ],
    relations: ['extends', 'implements', 'notifies'],
    animation: [
      {
        pieceIds: ['concrete-subject'],
        message: {
          en: 'State changes on ConcreteSubject.',
          fa: 'وضعیت روی ConcreteSubject عوض می‌شود.',
        },
      },
      {
        pieceIds: ['concrete-subject', 'subject'],
        message: {
          en: 'notify() walks the subscriber list.',
          fa: 'notify لیست مشترکین را طی می‌کند.',
        },
      },
      {
        pieceIds: ['observer-a'],
        message: {
          en: 'ObserverA.update() runs — first link in the chain.',
          fa: 'ObserverA.update اجرا می‌شود — حلقه اول زنجیره.',
        },
      },
      {
        pieceIds: ['observer-b'],
        message: {
          en: 'ObserverB.update() runs — fan-out complete, publishers stay unaware of UI details.',
          fa: 'ObserverB.update اجرا می‌شود — پخش تمام؛ ناشر از جزئیات UI بی‌خبر می‌ماند.',
        },
      },
    ],
  },
};

export const CODE_CHALLENGES: Record<string, CodeChallenge> = {
  'factory-method': {
    patternId: 'factory-method',
    title: {
      en: 'Fill the factory hook',
      fa: 'هوک کارخانه را کامل کنید',
    },
    brief: {
      en: 'Complete the TypeScript skeleton so creation stays behind factoryMethod().',
      fa: 'اسکلت TypeScript را کامل کنید تا ساخت پشت factoryMethod بماند.',
    },
    lines: [
      'abstract class Dialog {',
      '  abstract {{blank1}}(): Button;',
      '  render() {',
      '    const btn = this.{{blank2}}();',
      '    btn.onClick(() => this.close());',
      '  }',
      '}',
      '',
      'class WebDialog extends Dialog {',
      '  {{blank3}}(): Button {',
      '    return new {{blank4}}();',
      '  }',
      '}',
    ],
    blanks: [
      { id: 'blank1', choices: ['factoryMethod', 'getInstance', 'clone'], correct: 'factoryMethod' },
      { id: 'blank2', choices: ['factoryMethod', 'new Button', 'createAll'], correct: 'factoryMethod' },
      { id: 'blank3', choices: ['factoryMethod', 'constructor', 'notify'], correct: 'factoryMethod' },
      { id: 'blank4', choices: ['WebButton', 'Dialog', 'Singleton'], correct: 'WebButton' },
    ],
  },
  adapter: {
    patternId: 'adapter',
    title: {
      en: 'Wire the wrap',
      fa: 'پوشش را وصل کنید',
    },
    brief: {
      en: 'Make StockAdapter speak the analytics Target while wrapping the legacy feed.',
      fa: 'StockAdapter را طوری بنویسید که Target آنالیتیکس را صحبت کند و فید قدیمی را بپیچد.',
    },
    lines: [
      'interface AnalyticsTarget {',
      '  fetch(): Promise<Quote>;',
      '}',
      '',
      'class StockAdapter implements {{blank1}} {',
      '  constructor(private legacy: {{blank2}}) {}',
      '  async fetch(): Promise<Quote> {',
      '    const raw = await this.legacy.{{blank3}}();',
      '    return {{blank4}}(raw);',
      '  }',
      '}',
    ],
    blanks: [
      {
        id: 'blank1',
        choices: ['AnalyticsTarget', 'LegacyFeed', 'Observer'],
        correct: 'AnalyticsTarget',
      },
      { id: 'blank2', choices: ['LegacyFeed', 'AnalyticsTarget', 'HttpClient'], correct: 'LegacyFeed' },
      {
        id: 'blank3',
        choices: ['pullXmlTick', 'fetch', 'notify'],
        correct: 'pullXmlTick',
      },
      {
        id: 'blank4',
        choices: ['normalizeQuote', 'JSON.parse', 'cloneDeep'],
        correct: 'normalizeQuote',
      },
    ],
  },
  observer: {
    patternId: 'observer',
    title: {
      en: 'Close the notify loop',
      fa: 'حلقه notify را ببندید',
    },
    brief: {
      en: 'Subscribers register once; state changes fan out through notify().',
      fa: 'مشترکین یک‌بار ثبت می‌شوند؛ تغییر وضعیت از طریق notify پخش می‌شود.',
    },
    lines: [
      'class PriceFeed {',
      '  private subs: Observer[] = [];',
      '  attach(o: Observer) { this.subs.push(o); }',
      '  setPrice(p: number) {',
      '    this.price = p;',
      '    this.{{blank1}}();',
      '  }',
      '  private notify() {',
      '    for (const o of this.subs) o.{{blank2}}(this.price);',
      '  }',
      '}',
      '',
      'class ChartView implements {{blank3}} {',
      '  {{blank4}}(price: number) { this.redraw(price); }',
      '}',
    ],
    blanks: [
      { id: 'blank1', choices: ['notify', 'attach', 'clone'], correct: 'notify' },
      { id: 'blank2', choices: ['update', 'fetch', 'wrap'], correct: 'update' },
      { id: 'blank3', choices: ['Observer', 'Subject', 'Adapter'], correct: 'Observer' },
      { id: 'blank4', choices: ['update', 'attach', 'create'], correct: 'update' },
    ],
  },
};

export const REFACTOR_CHALLENGES: Record<string, RefactorChallenge> = {
  'factory-method': {
    patternId: 'factory-method',
    title: {
      en: 'Untangle construction switch',
      fa: 'سوییچ ساخت را باز کنید',
    },
    smell: {
      en: 'CheckoutService switches on platform strings and constructs concrete buttons inline. Adding mobile means editing this class again.',
      fa: 'CheckoutService روی رشتهٔ پلتفرم سوییچ می‌کند و دکمه را inline می‌سازد. افزودن موبایل یعنی دوباره همین کلاس را ویرایش کنید.',
    },
    minCorrect: 3,
    moves: [
      {
        id: 'extract-creator',
        label: {
          en: 'Introduce an abstract Dialog with factoryMethod()',
          fa: 'یک Dialog انتزاعی با factoryMethod معرفی کنید',
        },
        correct: true,
      },
      {
        id: 'concrete-per-platform',
        label: {
          en: 'Move each platform branch into its own ConcreteCreator',
          fa: 'هر شاخهٔ پلتفرم را به ConcreteCreator خودش ببرید',
        },
        correct: true,
      },
      {
        id: 'depend-on-product',
        label: {
          en: 'Have Checkout depend on Product/Button, not concrete widgets',
          fa: 'Checkout را به Product/Button وابسته کنید نه ویجت‌های مشخص',
        },
        correct: true,
      },
      {
        id: 'add-singleton',
        label: {
          en: 'Wrap Dialog in a Singleton for global access',
          fa: 'Dialog را در Singleton بپیچید تا سراسری شود',
        },
        correct: false,
      },
      {
        id: 'hardcode-web',
        label: {
          en: 'Hard-code WebButton everywhere to simplify types',
          fa: 'همه‌جا WebButton را hard-code کنید تا تایپ ساده‌تر شود',
        },
        correct: false,
      },
    ],
  },
  adapter: {
    patternId: 'adapter',
    title: {
      en: 'Stop rewriting the client',
      fa: 'بازنویسی کلاینت را متوقف کنید',
    },
    smell: {
      en: 'ReportingService calls LegacyXmlFeed.pullXmlTick() directly and parses XML in three places. A new JSON vendor is landing next sprint.',
      fa: 'ReportingService مستقیم LegacyXmlFeed.pullXmlTick را صدا می‌زند و XML را در سه جا پارس می‌کند. فروشندهٔ JSON هفته بعد می‌آید.',
    },
    minCorrect: 3,
    moves: [
      {
        id: 'define-target',
        label: {
          en: 'Define a stable AnalyticsTarget the reporting code already wants',
          fa: 'یک AnalyticsTarget پایدار تعریف کنید که کد گزارش از قبل می‌خواهد',
        },
        correct: true,
      },
      {
        id: 'wrap-legacy',
        label: {
          en: 'Add an Adapter that wraps LegacyXmlFeed and normalizes quotes',
          fa: 'Adapterای اضافه کنید که LegacyXmlFeed را بپیچد و quote را نرمال کند',
        },
        correct: true,
      },
      {
        id: 'client-on-target',
        label: {
          en: 'Point ReportingService at Target only — swap adapters per vendor',
          fa: 'ReportingService را فقط به Target وصل کنید — Adapter را عوض کنید',
        },
        correct: true,
      },
      {
        id: 'fork-service',
        label: {
          en: 'Duplicate ReportingService once per vendor feed',
          fa: 'ReportingService را برای هر فید فروشنده کپی کنید',
        },
        correct: false,
      },
      {
        id: 'edit-legacy',
        label: {
          en: 'Change LegacyXmlFeed’s public API to match analytics',
          fa: 'API عمومی LegacyXmlFeed را با آنالیتیکس یکی کنید',
        },
        correct: false,
      },
    ],
  },
  observer: {
    patternId: 'observer',
    title: {
      en: 'Break the notify spaghetti',
      fa: 'اسپاگتی notify را باز کنید',
    },
    smell: {
      en: 'OrderBook mutates price then manually calls chart.redraw(), log.write(), and badge.flash(). Every new widget edits OrderBook.',
      fa: 'OrderBook قیمت را عوض می‌کند بعد دستی chart.redraw، log.write و badge.flash را صدا می‌زند. هر ویجت جدید OrderBook را ویرایش می‌کند.',
    },
    minCorrect: 3,
    moves: [
      {
        id: 'subject-list',
        label: {
          en: 'Give OrderBook a subscriber list with attach/detach',
          fa: 'به OrderBook لیست مشترک با attach/detach بدهید',
        },
        correct: true,
      },
      {
        id: 'notify-loop',
        label: {
          en: 'Replace direct widget calls with a single notify() loop',
          fa: 'فراخوانی مستقیم ویجت‌ها را با یک حلقه notify جایگزین کنید',
        },
        correct: true,
      },
      {
        id: 'observer-iface',
        label: {
          en: 'Have Chart/Log/Badge implement a shared Observer.update()',
          fa: 'Chart/Log/Badge یک Observer.update مشترک پیاده کنند',
        },
        correct: true,
      },
      {
        id: 'god-object',
        label: {
          en: 'Pass Chart, Log, and Badge into OrderBook’s constructor forever',
          fa: 'Chart و Log و Badge را برای همیشه به سازندهٔ OrderBook بدهید',
        },
        correct: false,
      },
      {
        id: 'polling',
        label: {
          en: 'Have each widget poll OrderBook on a timer instead',
          fa: 'هر ویجت OrderBook را با تایمر poll کند',
        },
        correct: false,
      },
    ],
  },
};

export const ARENA_PATTERN_IDS = ['factory-method', 'adapter', 'observer'] as const;
