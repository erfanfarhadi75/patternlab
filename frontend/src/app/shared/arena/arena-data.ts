import { BlockChallenge, CodeChallenge, RefactorChallenge } from './arena.models';

export const PATTERN_ART: Record<string, string> = {
  'factory-method': '/assets/arena/forge-create.svg',
  adapter: '/assets/arena/plug-adapter.svg',
  observer: '/assets/arena/notify-pulse.svg',
};

export const BLOCK_CHALLENGES: Record<string, BlockChallenge> = {
  'factory-method': {
    patternId: 'factory-method',
    brief: {
      en: 'Creator builds Product — subclass picks which.',
      fa: 'Creator می‌سازد؛ زیرکلاس انتخاب می‌کند.',
    },
    pieces: [
      { id: 'creator', label: { en: 'Creator', fa: 'Creator' }, hint: { en: 'factoryMethod()', fa: 'factoryMethod()' } },
      {
        id: 'concrete-creator',
        label: { en: 'ConcreteCreator', fa: 'ConcreteCreator' },
        hint: { en: 'override + new', fa: 'override + new' },
      },
      { id: 'product', label: { en: 'Product', fa: 'Product' }, hint: { en: 'client contract', fa: 'قرارداد کلاینت' } },
      {
        id: 'concrete-product',
        label: { en: 'ConcreteProduct', fa: 'ConcreteProduct' },
        hint: { en: 'real instance', fa: 'نمونه واقعی' },
      },
      {
        id: 'singleton',
        label: { en: 'Singleton', fa: 'Singleton' },
        hint: { en: 'trap', fa: 'تله' },
        distractor: true,
      },
    ],
    requiredPieceIds: ['creator', 'concrete-creator', 'product', 'concrete-product'],
    expectedEdges: [
      { from: 'concrete-creator', to: 'creator', relation: 'extends' },
      { from: 'concrete-product', to: 'product', relation: 'implements' },
      { from: 'concrete-creator', to: 'concrete-product', relation: 'creates' },
    ],
    // Abstract on top, concrete below — creates runs left → right.
    solveLayout: {
      creator: { col: 0, row: 0 },
      product: { col: 1, row: 0 },
      'concrete-creator': { col: 0, row: 1 },
      'concrete-product': { col: 1, row: 1 },
    },
    relations: ['extends', 'implements', 'creates'],
    animation: [
      { pieceIds: ['creator'], message: { en: 'Call factoryMethod()', fa: 'صدا: factoryMethod()' } },
      { pieceIds: ['concrete-creator'], message: { en: 'Subclass chooses class', fa: 'زیرکلاس کلاس را انتخاب می‌کند' } },
      {
        pieceIds: ['concrete-creator', 'concrete-product'],
        message: { en: 'new ConcreteProduct()', fa: 'new ConcreteProduct()' },
      },
      {
        pieceIds: ['product', 'concrete-product'],
        message: { en: 'Return as Product — client stays free', fa: 'برگشت به‌صورت Product — کلاینت آزاد می‌ماند' },
      },
    ],
  },
  adapter: {
    patternId: 'adapter',
    brief: {
      en: 'Wrap old API so Client speaks Target.',
      fa: 'API قدیمی را بپیچ تا Client با Target حرف بزند.',
    },
    pieces: [
      { id: 'target', label: { en: 'Target', fa: 'Target' }, hint: { en: 'wanted API', fa: 'API مطلوب' } },
      { id: 'adapter', label: { en: 'Adapter', fa: 'Adapter' }, hint: { en: 'translator', fa: 'مترجم' } },
      { id: 'adaptee', label: { en: 'Adaptee', fa: 'Adaptee' }, hint: { en: 'legacy', fa: 'قدیمی' } },
      { id: 'client', label: { en: 'Client', fa: 'Client' }, hint: { en: 'uses Target', fa: 'فقط Target' } },
      { id: 'facade', label: { en: 'Facade', fa: 'Facade' }, hint: { en: 'trap', fa: 'تله' }, distractor: true },
    ],
    requiredPieceIds: ['target', 'adapter', 'adaptee', 'client'],
    expectedEdges: [
      { from: 'adapter', to: 'target', relation: 'implements' },
      { from: 'adapter', to: 'adaptee', relation: 'wraps' },
      { from: 'client', to: 'target', relation: 'uses' },
    ],
    // Client mid-left → Target; Adapter under Target wraps Adaptee.
    solveLayout: {
      client: { col: 0, row: 0.5 },
      target: { col: 1, row: 0 },
      adapter: { col: 1, row: 1 },
      adaptee: { col: 2, row: 1 },
    },
    relations: ['implements', 'wraps', 'uses'],
    animation: [
      { pieceIds: ['client', 'target'], message: { en: 'Client → Target.request()', fa: 'Client → Target.request()' } },
      { pieceIds: ['adapter'], message: { en: 'Adapter maps the call', fa: 'Adapter نگاشت می‌کند' } },
      {
        pieceIds: ['adapter', 'adaptee'],
        message: { en: 'Adaptee.specificRequest()', fa: 'Adaptee.specificRequest()' },
      },
      {
        pieceIds: ['client', 'adapter', 'adaptee'],
        message: { en: 'Result back — mismatch hidden', fa: 'نتیجه برگشت — ناسازگاری پنهان' },
      },
    ],
  },
  observer: {
    patternId: 'observer',
    brief: {
      en: 'One Subject → many Observers on change.',
      fa: 'یک Subject → چند Observer با تغییر.',
    },
    pieces: [
      { id: 'subject', label: { en: 'Subject', fa: 'Subject' }, hint: { en: 'attach/notify', fa: 'attach/notify' } },
      {
        id: 'concrete-subject',
        label: { en: 'ConcreteSubject', fa: 'ConcreteSubject' },
        hint: { en: 'holds state', fa: 'نگهدار وضعیت' },
      },
      { id: 'observer', label: { en: 'Observer', fa: 'Observer' }, hint: { en: 'update()', fa: 'update()' } },
      { id: 'observer-a', label: { en: 'ObserverA', fa: 'ObserverA' }, hint: { en: 'subscriber', fa: 'مشترک' } },
      { id: 'observer-b', label: { en: 'ObserverB', fa: 'ObserverB' }, hint: { en: 'subscriber', fa: 'مشترک' } },
      { id: 'mediator', label: { en: 'Mediator', fa: 'Mediator' }, hint: { en: 'trap', fa: 'تله' }, distractor: true },
    ],
    requiredPieceIds: ['subject', 'concrete-subject', 'observer', 'observer-a', 'observer-b'],
    expectedEdges: [
      { from: 'concrete-subject', to: 'subject', relation: 'extends' },
      { from: 'observer-a', to: 'observer', relation: 'implements' },
      { from: 'observer-b', to: 'observer', relation: 'implements' },
      { from: 'concrete-subject', to: 'observer-a', relation: 'notifies' },
      { from: 'concrete-subject', to: 'observer-b', relation: 'notifies' },
    ],
    // Subject stack left; Observer interface centered over A/B on the right.
    solveLayout: {
      subject: { col: 0, row: 0 },
      'concrete-subject': { col: 0, row: 1 },
      observer: { col: 2, row: 0 },
      'observer-a': { col: 1.35, row: 1 },
      'observer-b': { col: 2.65, row: 1 },
    },
    relations: ['extends', 'implements', 'notifies'],
    animation: [
      { pieceIds: ['concrete-subject'], message: { en: 'State changes', fa: 'وضعیت عوض شد' } },
      { pieceIds: ['concrete-subject', 'subject'], message: { en: 'notify() fans out', fa: 'notify پخش می‌کند' } },
      { pieceIds: ['observer-a'], message: { en: 'ObserverA.update()', fa: 'ObserverA.update()' } },
      { pieceIds: ['observer-b'], message: { en: 'ObserverB.update() — done', fa: 'ObserverB.update() — تمام' } },
    ],
  },
};

export const CODE_CHALLENGES: Record<string, CodeChallenge> = {
  'factory-method': {
    patternId: 'factory-method',
    title: { en: 'Fill the hook', fa: 'هوک را پر کن' },
    brief: { en: 'Creation stays behind factoryMethod().', fa: 'ساخت فقط پشت factoryMethod().' },
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
    title: { en: 'Wire the wrap', fa: 'پوشش را وصل کن' },
    brief: { en: 'Adapter speaks Target, wraps legacy.', fa: 'Adapter = Target + wrap قدیمی.' },
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
      { id: 'blank1', choices: ['AnalyticsTarget', 'LegacyFeed', 'Observer'], correct: 'AnalyticsTarget' },
      { id: 'blank2', choices: ['LegacyFeed', 'AnalyticsTarget', 'HttpClient'], correct: 'LegacyFeed' },
      { id: 'blank3', choices: ['pullXmlTick', 'fetch', 'notify'], correct: 'pullXmlTick' },
      { id: 'blank4', choices: ['normalizeQuote', 'JSON.parse', 'cloneDeep'], correct: 'normalizeQuote' },
    ],
  },
  observer: {
    patternId: 'observer',
    title: { en: 'Close the loop', fa: 'حلقه را ببند' },
    brief: { en: 'Change → notify → update.', fa: 'تغییر → notify → update.' },
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
    title: { en: 'Kill the switch', fa: 'سوییچ را بکش' },
    smell: {
      en: 'Checkout switches on platform and builds widgets inline.',
      fa: 'Checkout روی پلتفرم سوییچ می‌کند و ویجت را inline می‌سازد.',
    },
    minCorrect: 3,
    moves: [
      {
        id: 'extract-creator',
        label: { en: 'Abstract Dialog + factoryMethod()', fa: 'Dialog انتزاعی + factoryMethod()' },
        correct: true,
      },
      {
        id: 'concrete-per-platform',
        label: { en: 'One ConcreteCreator per platform', fa: 'یک ConcreteCreator برای هر پلتفرم' },
        correct: true,
      },
      {
        id: 'depend-on-product',
        label: { en: 'Depend on Product/Button only', fa: 'فقط به Product/Button وابسته شو' },
        correct: true,
      },
      {
        id: 'add-singleton',
        label: { en: 'Wrap Dialog in Singleton', fa: 'Dialog را Singleton کن' },
        correct: false,
      },
      {
        id: 'hardcode-web',
        label: { en: 'Hard-code WebButton everywhere', fa: 'همه‌جا WebButton سخت‌کد' },
        correct: false,
      },
    ],
  },
  adapter: {
    patternId: 'adapter',
    title: { en: 'Stop rewriting Client', fa: 'دیگر Client را بازنویس نکن' },
    smell: {
      en: 'Reporting calls LegacyXmlFeed and parses XML in 3 places.',
      fa: 'Reporting مستقیم LegacyXmlFeed را صدا می‌زند و XML را ۳ جا پارس می‌کند.',
    },
    minCorrect: 3,
    moves: [
      {
        id: 'define-target',
        label: { en: 'Stable AnalyticsTarget', fa: 'AnalyticsTarget پایدار' },
        correct: true,
      },
      {
        id: 'wrap-legacy',
        label: { en: 'Adapter wraps LegacyXmlFeed', fa: 'Adapter دور LegacyXmlFeed' },
        correct: true,
      },
      {
        id: 'client-on-target',
        label: { en: 'Reporting → Target only', fa: 'Reporting فقط → Target' },
        correct: true,
      },
      {
        id: 'fork-service',
        label: { en: 'Duplicate service per vendor', fa: 'سرویس را برای هر فروشنده کپی کن' },
        correct: false,
      },
      {
        id: 'edit-legacy',
        label: { en: 'Change legacy public API', fa: 'API عمومی قدیمی را عوض کن' },
        correct: false,
      },
    ],
  },
  observer: {
    patternId: 'observer',
    title: { en: 'Break notify spaghetti', fa: 'اسپاگتی notify را ببر' },
    smell: {
      en: 'OrderBook manually calls chart, log, badge after every price change.',
      fa: 'OrderBook بعد از هر قیمت دستی chart و log و badge را صدا می‌زند.',
    },
    minCorrect: 3,
    moves: [
      {
        id: 'subject-list',
        label: { en: 'Subscriber list + attach/detach', fa: 'لیست مشترک + attach/detach' },
        correct: true,
      },
      {
        id: 'notify-loop',
        label: { en: 'One notify() loop', fa: 'یک حلقه notify()' },
        correct: true,
      },
      {
        id: 'observer-iface',
        label: { en: 'Shared Observer.update()', fa: 'Observer.update() مشترک' },
        correct: true,
      },
      {
        id: 'god-object',
        label: { en: 'Pass every widget into constructor', fa: 'همه ویجت‌ها را به constructor بده' },
        correct: false,
      },
      {
        id: 'polling',
        label: { en: 'Widgets poll on a timer', fa: 'ویجت‌ها با تایمر poll کنند' },
        correct: false,
      },
    ],
  },
};

export const ARENA_PATTERN_IDS = ['factory-method', 'adapter', 'observer'] as const;
