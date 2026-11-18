using PatternLab.Api.Models;

namespace PatternLab.Api.Services;

public static class ContentSeed
{
    public static List<CategoryDto> BuildCategories() =>
    [
        new("creational", T("Creational", "ایجادکننده"), T("Patterns that control how objects are created.", "الگوهایی که نحوهٔ ساخت اشیاء را کنترل می‌کنند.")),
        new("structural", T("Structural", "ساختاری"), T("Patterns that compose objects into larger structures.", "الگوهایی که اشیاء را در ساختارهای بزرگ‌تر ترکیب می‌کنند.")),
        new("behavioral", T("Behavioral", "رفتاری"), T("Patterns that define how objects communicate and share responsibility.", "الگوهایی که ارتباط و تقسیم مسئولیت بین اشیاء را تعریف می‌کنند."))
    ];

    public static List<PatternDetailDto> BuildPatterns() =>
    [
        BuildFactoryMethod(),
        BuildAdapter(),
        BuildObserver()
    ];

    private static Dictionary<string, string> T(string en, string fa) =>
        new() { ["en"] = en, ["fa"] = fa };

    private static LearnSectionDto Section(
        string id,
        string enTitle,
        string faTitle,
        string juniorEn,
        string juniorFa,
        string midEn,
        string midFa,
        string seniorEn,
        string seniorFa,
        string? code = null,
        string? walkJuniorEn = null,
        string? walkJuniorFa = null,
        string? walkMidEn = null,
        string? walkMidFa = null,
        string? walkSeniorEn = null,
        string? walkSeniorFa = null)
    {
        Dictionary<string, string>? Walk(string? en, string? fa) =>
            en is null ? null : T(en, fa ?? en);

        return new LearnSectionDto(id, T(enTitle, faTitle), new Dictionary<string, LevelTextDto>
        {
            ["junior"] = new LevelTextDto(T(juniorEn, juniorFa), code, Walk(walkJuniorEn, walkJuniorFa)),
            ["mid"] = new LevelTextDto(T(midEn, midFa), code, Walk(walkMidEn ?? walkJuniorEn, walkMidFa ?? walkJuniorFa)),
            ["senior"] = new LevelTextDto(
                T(seniorEn, seniorFa),
                code,
                Walk(walkSeniorEn ?? walkMidEn ?? walkJuniorEn, walkSeniorFa ?? walkMidFa ?? walkJuniorFa))
        });
    }

    private static QuizQuestionDto Q(
        string id,
        string level,
        string kind,
        string enPrompt,
        string faPrompt,
        string[] enOptions,
        string[] faOptions,
        int correct,
        string enExpl,
        string faExpl,
        int xp,
        bool unlock = false) =>
        new(
            id,
            level,
            kind,
            T(enPrompt, faPrompt),
            new Dictionary<string, List<string>>
            {
                ["en"] = enOptions.ToList(),
                ["fa"] = faOptions.ToList()
            },
            correct,
            T(enExpl, faExpl),
            xp,
            unlock
        );

    private static PatternDetailDto BuildFactoryMethod()
    {
        const string code = """
            // Product hierarchy
            interface INotifier {
              send(message: string): void;
            }

            class EmailNotifier implements INotifier {
              send(message: string) {
                console.log(`Email: ${message}`);
              }
            }

            class SmsNotifier implements INotifier {
              send(message: string) {
                console.log(`SMS: ${message}`);
              }
            }

            // Creator with factory method
            abstract class NotificationService {
              abstract createNotifier(): INotifier;

              notify(message: string) {
                const notifier = this.createNotifier();
                notifier.send(message);
              }
            }

            class EmailNotificationService extends NotificationService {
              createNotifier() {
                return new EmailNotifier();
              }
            }

            class SmsNotificationService extends NotificationService {
              createNotifier() {
                return new SmsNotifier();
              }
            }
            """;

        return new PatternDetailDto(
            "factory-method",
            "creational",
            T("Factory Method", "متد کارخانه"),
            T(
                "Define an interface for creating an object, but let subclasses decide which class to instantiate.",
                "واسطی برای ساخت شیء تعریف کنید، اما اجازه دهید زیرکلاس‌ها تصمیم بگیرند کدام کلاس نمونه‌سازی شود."
            ),
            T(
                "Delegate object creation to subclasses without hard-coding concrete types.",
                "ساخت شیء را به زیرکلاس‌ها بسپارید بدون قفل‌شدن روی نوع‌های مشخص."
            ),
            [
                Section(
                    "intro",
                    "Introduction", "مقدمه",
                    "Factory Method helps you create objects without writing `new ConcreteClass()` everywhere. You ask a creator for a product, and a subclass chooses the exact type.",
                    "متد کارخانه کمک می‌کند اشیاء را بدون نوشتن `new ConcreteClass()` در همه‌جا بسازید. از یک سازنده محصول می‌خواهید و زیرکلاس نوع دقیق را انتخاب می‌کند.",
                    "Factory Method separates the 'when to create' workflow from the 'which concrete type' decision. The base creator owns the process; subclasses plug in the product.",
                    "متد کارخانه جریان «کی بسازیم» را از تصمیم «کدام نوع مشخص» جدا می‌کند. سازندهٔ پایه مالک فرایند است؛ زیرکلاس‌ها محصول را وصل می‌کنند.",
                    "Treat Factory Method as a seam for open/closed extension: new product variants ship as new creator subclasses without rewriting callers that depend on the abstract creator API.",
                    "متد کارخانه را به‌عنوان درز توسعهٔ باز/بسته ببینید: گونه‌های جدید محصول با زیرکلاس‌های سازنده اضافه می‌شوند بدون بازنویسی فراخوان‌هایی که به API انتزاعی وابسته‌اند."
                ),
                Section(
                    "problem",
                    "Problem", "مسئله",
                    "Imagine a notification system that sometimes emails and sometimes texts. If every screen does `new EmailNotifier()`, adding Slack later means hunting down every construction site.",
                    "سیستم اعلانی را تصور کنید که گاهی ایمیل و گاهی پیامک می‌فرستد. اگر هر صفحه `new EmailNotifier()` بنویسد، افزودن اسلک یعنی پیدا کردن همهٔ محل‌های ساخت.",
                    "Concrete construction scattered through features couples UI and domain logic to product classes, blocks testing with fakes, and makes channel rollout a cross-cutting rewrite.",
                    "ساخت مشخص پخش‌شده در فیچرها، UI و دامنه را به کلاس‌های محصول قفل می‌کند، تست با فیک را سخت می‌کند و افزودن کانال را به بازنویسی سراسری تبدیل می‌کند.",
                    "The design smell is violated dependency inversion: high-level notification orchestration depends on low-level transport types. You need a creation polymorphism point aligned with the orchestration abstraction.",
                    "بوی طراحی نقض وارونگی وابستگی است: ارکستراسیون سطح‌بالای اعلان به نوع‌های سطح‌پایین انتقال وابسته است. به نقطهٔ چندریختی ساخت هم‌راستا با انتزاع ارکستراسیون نیاز دارید."
                ),
                Section(
                    "analogy",
                    "Real-world analogy", "تشابه دنیای واقعی",
                    "A logistics company has a general shipping process, but local branches decide whether a package goes by truck or bike. The process is shared; the vehicle choice is local.",
                    "شرکت لجستیک فرایند ارسال کلی دارد، اما شعبه‌های محلی تصمیم می‌گیرند بسته با کامیون برود یا دوچرخه. فرایند مشترک است؛ انتخاب وسیله محلی است.",
                    "Think of a franchise kitchen: headquarters defines 'prepare meal then serve'. Each franchise picks the concrete dish factory (pizza vs sushi) without changing the service ritual.",
                    "آشپزخانهٔ فرانچایز را در نظر بگیرید: ستاد «غذا را آماده کن سپس سرو کن» را تعریف می‌کند. هر شعبه کارخانهٔ غذای مشخص (پیتزا یا سوشی) را انتخاب می‌کند بدون تغییر آیین سرویس.",
                    "The analogy maps to template + hook: invariant logistics steps live in the creator; the variant hook is `createTransport()`. Extending coverage means new branches, not rewriting HQ.",
                    "تشابه به قالب + هوک نگاشت می‌شود: گام‌های ثابت لجستیک در سازنده می‌مانند؛ هوک متغیر `createTransport()` است. گسترش پوشش یعنی شعبه‌های جدید، نه بازنویسی ستاد."
                ),
                Section(
                    "solution",
                    "Solution", "راه‌حل",
                    "Create an abstract creator with a `createNotifier()` method. Subclasses return Email or SMS notifiers. Callers only talk to the abstract service.",
                    "یک سازندهٔ انتزاعی با متد `createNotifier()` بسازید. زیرکلاس‌ها نوتیفایر ایمیل یا پیامک برمی‌گردانند. فراخوان‌ها فقط با سرویس انتزاعی حرف می‌زنند.",
                    "Keep business steps (`notify`) on the abstract creator. Override only the factory method. Optionally provide a default product while still allowing replacement.",
                    "گام‌های کسب‌وکار (`notify`) را روی سازندهٔ انتزاعی نگه دارید. فقط متد کارخانه را override کنید. در صورت نیاز محصول پیش‌فرض بدهید اما جایگزینی را باز بگذارید.",
                    "Prefer creator hierarchies when product families evolve with parallel service variants. If creation needs runtime parameters only, a simple parameterized factory function may be enough—avoid ceremony.",
                    "وقتی خانواده‌های محصول همگام با گونه‌های سرویس رشد می‌کنند، سلسله‌مراتب سازنده مناسب است. اگر ساخت فقط به پارامترهای زمان اجرا نیاز دارد، یک تابع کارخانهٔ پارامتری کافی است—تشریفات اضافه نکنید."
                ),
                Section(
                    "structure",
                    "Structure overview", "نمای ساختار",
                    "Product interface → concrete products. Creator with factory method → concrete creators. Client depends on Creator + Product abstractions.",
                    "واسط محصول ← محصولات مشخص. سازنده با متد کارخانه ← سازنده‌های مشخص. کلاینت به انتزاع‌های Creator و Product وابسته است.",
                    "Collaborators: Product, ConcreteProduct, Creator, ConcreteCreator. The creator may also implement a template method that calls the factory method internally.",
                    "همکاران: Product، ConcreteProduct، Creator، ConcreteCreator. سازنده می‌تواند متد قالبی داشته باشد که داخلش متد کارخانه را صدا می‌زند.",
                    "Watch for leaky abstractions: if concrete creators need radically different construction graphs, consider Abstract Factory or a composition-based provider instead of deepening inheritance.",
                    "مواظب انتزاع نشتی‌دار باشید: اگر سازنده‌های مشخص گراف ساخت کاملاً متفاوتی لازم دارند، Abstract Factory یا provider مبتنی بر ترکیب را به‌جای عمیق‌کردن وراثت در نظر بگیرید.",
                    code: code,
                    walkJuniorEn: "The abstract `NotificationService` owns `notify`. Subclasses only implement `createNotifier`, so adding a push channel means a new subclass—not edits to every caller.",
                    walkJuniorFa: "سرویس انتزاعی `NotificationService` مالک `notify` است. زیرکلاس‌ها فقط `createNotifier` را پیاده می‌کنند؛ پس افزودن کانال پوش یعنی زیرکلاس جدید—نه ویرایش همهٔ فراخوان‌ها.",
                    walkMidEn: "Notice `notify` never mentions Email or SMS. That inversion keeps orchestration stable while product types grow. Tests can subclass the creator and return a fake notifier.",
                    walkMidFa: "توجه کنید `notify` هرگز از ایمیل یا پیامک نام نمی‌برد. این وارونگی ارکستراسیون را پایدار نگه می‌دارد. تست‌ها می‌توانند سازنده را subclass کنند و نوتیفایر جعلی برگردانند.",
                    walkSeniorEn: "This is inheritance-based Factory Method. In TypeScript you can also inject a `() => INotifier` strategy for the same seam with less hierarchy—choose based on whether creators carry extra domain behavior.",
                    walkSeniorFa: "این نسخهٔ وراثتی متد کارخانه است. در TypeScript می‌توانید `() => INotifier` تزریق کنید تا همان درز با سلسله‌مراتب کمتر ساخته شود—بر اساس اینکه سازنده‌ها رفتار دامنهٔ اضافه دارند انتخاب کنید."
                ),
                Section(
                    "when",
                    "When to use / not use", "کی استفاده کنیم / نکنیم",
                    "Use when subclasses should choose the product type, or you want to defer creation details. Skip when you only ever create one concrete class.",
                    "وقتی زیرکلاس‌ها باید نوع محصول را انتخاب کنند یا می‌خواهید جزئیات ساخت را عقب بیندازید استفاده کنید. اگر فقط یک کلاس مشخص می‌سازید، لازم نیست.",
                    "Use when parallel creator/product hierarchies stay aligned. Avoid when a single factory function with a switch (or DI registration) already keeps call sites clean.",
                    "وقتی سلسله‌مراتب موازی سازنده/محصول هم‌راستا می‌مانند استفاده کنید. اگر یک تابع کارخانه با switch (یا ثبت DI) کافی است، از الگو اجتناب کنید.",
                    "Prefer when creation polymorphism must travel with polymorphic behavior on the creator. Do not force Factory Method onto simple DTO mapping or one-off builders.",
                    "وقتی چندریختی ساخت باید همراه رفتار چندریختی سازنده حرکت کند ترجیح دهید. آن را به نگاشت DTO ساده یا builderهای یک‌باره تحمیل نکنید."
                ),
                Section(
                    "proscons",
                    "Pros and cons", "مزایا و معایب",
                    "Pros: less coupling to concrete classes, easier extension. Cons: more classes, can feel heavy for tiny apps.",
                    "مزایا: جفت‌شدگی کمتر به کلاس‌های مشخص، توسعه آسان‌تر. معایب: کلاس‌های بیشتر؛ برای اپ‌های خیلی کوچک سنگین به نظر می‌رسد.",
                    "Pros: open/closed for new products, test seams. Cons: inheritance tax, risk of parallel hierarchy drift.",
                    "مزایا: باز/بسته برای محصولات جدید، درز تست. معایب: هزینهٔ وراثت، خطر انحراف سلسله‌مراتب موازی.",
                    "Pros: stable orchestration API, clear extension points. Cons: indirection cost, possible over-abstraction vs composition/DI factories.",
                    "مزایا: API ارکستراسیون پایدار، نقاط توسعه روشن. معایب: هزینهٔ غیرمستقیم، احتمال انتزاع بیش‌ازحد در برابر کارخانه‌های ترکیب/DI."
                ),
                Section(
                    "similar",
                    "Similar patterns", "الگوهای مشابه",
                    "Related ideas: Abstract Factory (families of products), Builder (stepwise construction), simple factory functions.",
                    "ایده‌های مرتبط: Abstract Factory (خانواده‌های محصول)، Builder (ساخت گام‌به‌گام)، توابع کارخانهٔ ساده.",
                    "Abstract Factory often uses Factory Methods inside. Prototype clones existing instances instead of choosing a class via subclass.",
                    "Abstract Factory اغلب داخلش از متدهای کارخانه استفاده می‌کند. Prototype به‌جای انتخاب کلاس از طریق زیرکلاس، نمونهٔ موجود را کلون می‌کند.",
                    "Compare with Strategy: Strategy swaps behavior; Factory Method swaps product type used by a workflow. They can combine—factory produces a strategy instance.",
                    "با Strategy مقایسه کنید: Strategy رفتار را عوض می‌کند؛ متد کارخانه نوع محصول استفاده‌شده در جریان کار را عوض می‌کند. می‌توانند ترکیب شوند."
                )
            ],
            [
                Q("fm-j1", "junior", "quiz",
                    "What does the Factory Method mainly let subclasses decide?",
                    "متد کارخانه عمدتاً به زیرکلاس‌ها اجازه می‌دهد چه چیزی را تصمیم بگیرند؟",
                    ["Which concrete product to create", "How to serialize objects", "Database schema", "CSS theme"],
                    ["کدام محصول مشخص ساخته شود", "چگونه اشیاء را سریالایز کنند", "اسکیمای پایگاه‌داده", "تم CSS"],
                    0,
                    "Subclasses override the factory method to choose the concrete product class.",
                    "زیرکلاس‌ها متد کارخانه را override می‌کنند تا کلاس محصول مشخص را انتخاب کنند.",
                    15),
                Q("fm-j2", "junior", "quiz",
                    "In the notification example, where should `new EmailNotifier()` live?",
                    "در مثال اعلان، `new EmailNotifier()` باید کجا باشد؟",
                    ["Inside EmailNotificationService.createNotifier", "In every UI button handler", "In the Product interface", "In global CSS"],
                    ["داخل EmailNotificationService.createNotifier", "در هر handler دکمه UI", "در واسط Product", "در CSS سراسری"],
                    0,
                    "Construction stays inside the concrete creator's factory method.",
                    "ساخت داخل متد کارخانهٔ سازندهٔ مشخص می‌ماند.",
                    15),
                Q("fm-m1", "mid", "challenge",
                    "A team adds PushNotifier. What is the smallest Factory Method-friendly change?",
                    "تیم PushNotifier اضافه می‌کند. کوچک‌ترین تغییر سازگار با متد کارخانه چیست؟",
                    ["Add PushNotificationService overriding createNotifier", "Edit notify() to hard-code PushNotifier", "Delete the Product interface", "Put a switch in every caller"],
                    ["افزودن PushNotificationService که createNotifier را override کند", "ویرایش notify برای hard-code کردن PushNotifier", "حذف واسط Product", "گذاشتن switch در هر فراخوان"],
                    0,
                    "Extend via a new concrete creator rather than rewriting the shared workflow.",
                    "از طریق سازندهٔ مشخص جدید گسترش دهید نه بازنویسی جریان مشترک.",
                    25),
                Q("fm-m2", "mid", "quiz",
                    "Why is Factory Method helpful for tests?",
                    "چرا متد کارخانه برای تست مفید است؟",
                    ["You can subclass the creator and return a fake product", "It disables type checking", "It removes the need for assertions", "It forces network calls"],
                    ["می‌توانید سازنده را subclass کنید و محصول جعلی برگردانید", "چک نوع را غیرفعال می‌کند", "نیاز به assertion را حذف می‌کند", "فراخوانی شبکه را اجباری می‌کند"],
                    0,
                    "The creation seam lets tests substitute fakes without touching orchestration.",
                    "درز ساخت اجازه می‌دهد تست‌ها بدون دست‌زدن به ارکستراسیون، فیک جایگزین کنند.",
                    25),
                Q("fm-s1", "senior", "challenge",
                    "You only need runtime channel selection from config, with no extra creator behavior. Best fit?",
                    "فقط انتخاب کانال زمان اجرا از کانفیگ لازم است و رفتار اضافه روی سازنده ندارید. بهترین گزینه؟",
                    ["A lightweight factory function / DI provider", "Deep Creator inheritance for each config flag", "Copy-paste new EmailNotifier in UI", "Observer pattern"],
                    ["تابع کارخانه سبک / provider در DI", "وراثت عمیق Creator برای هر فلگ کانفیگ", "کپی-پیست EmailNotifier در UI", "الگوی Observer"],
                    0,
                    "Factory Method ceremony is optional when a parameterized factory already provides the seam.",
                    "تشریفات متد کارخانه اختیاری است وقتی کارخانهٔ پارامتری همان درز را می‌دهد.",
                    35),
                Q("fm-s2", "senior", "quiz",
                    "Factory Method vs Strategy—what is the primary difference?",
                    "متد کارخانه در برابر Strategy—تفاوت اصلی چیست؟",
                    ["Factory Method varies the product type; Strategy varies interchangeable behavior", "They are identical", "Strategy only works in Java", "Factory Method is only for UI"],
                    ["متد کارخانه نوع محصول را عوض می‌کند؛ Strategy رفتار قابل‌تعویض را", "کاملاً یکسان‌اند", "Strategy فقط در جاوا کار می‌کند", "متد کارخانه فقط برای UI است"],
                    0,
                    "They solve related but distinct variation points and can be combined.",
                    "نقاط تغییر مرتبط اما متمایز را حل می‌کنند و قابل ترکیب‌اند.",
                    35)
            ],
            ["abstract-factory", "builder"],
            false
        );
    }

    private static PatternDetailDto BuildAdapter()
    {
        const string code = """
            // Legacy analytics SDK (cannot change)
            class LegacyTracker {
              trackEvent(name: string, payload: Record<string, string>) {
                console.log(name, payload);
              }
            }

            // App expects this port
            interface AnalyticsPort {
              capture(event: string, props?: Record<string, unknown>): void;
            }

            class LegacyTrackerAdapter implements AnalyticsPort {
              constructor(private readonly legacy: LegacyTracker) {}

              capture(event: string, props: Record<string, unknown> = {}) {
                const payload: Record<string, string> = {};
                for (const [k, v] of Object.entries(props)) {
                  payload[k] = String(v);
                }
                this.legacy.trackEvent(event, payload);
              }
            }

            // Client code depends only on AnalyticsPort
            function checkout(analytics: AnalyticsPort) {
              analytics.capture('purchase', { total: 42 });
            }
            """;

        return new PatternDetailDto(
            "adapter",
            "structural",
            T("Adapter", "آداپتر"),
            T(
                "Convert the interface of a class into another interface clients expect.",
                "واسط یک کلاس را به واسطی تبدیل کنید که کلاینت انتظار دارد."
            ),
            T(
                "Make incompatible APIs work together without rewriting either side.",
                "APIهای ناسازگار را بدون بازنویسی طرفین کنار هم کار کنید."
            ),
            [
                Section(
                    "intro",
                    "Introduction", "مقدمه",
                    "Adapter sits between your code and an awkward dependency. Your app speaks one shape; the adapter translates calls to the dependency's shape.",
                    "آداپتر بین کد شما و وابستگی ناسازگار می‌نشیند. اپ شما یک شکل حرف می‌زند؛ آداپتر فراخوانی‌ها را به شکل وابستگی ترجمه می‌کند.",
                    "Adapter is a structural bridge for interface mismatch—especially legacy SDKs, third-party libraries, or gradual migrations between domain ports.",
                    "آداپتر پل ساختاری برای ناهماهنگی واسط است—به‌ویژه SDKهای قدیمی، کتابخانه‌های ثالث، یا مهاجرت تدریجی بین پورت‌های دامنه.",
                    "Prefer Adapter when you own the client contract (hexagonal port) and must wrap an unowned adaptee. Distinguish from Facade (simplify) and Decorator (add behavior).",
                    "وقتی قرارداد کلاینت (پورت شش‌ضلعی) مال شماست و adaptee غیرقابل‌تغییر است آداپتر را ترجیح دهید. از Facade (ساده‌سازی) و Decorator (افزودن رفتار) تمایز دهید."
                ),
                Section(
                    "problem",
                    "Problem", "مسئله",
                    "Your checkout flow wants `capture(event, props)`, but the vendor SDK only offers `trackEvent(name, stringPayload)`. Changing the vendor is impossible; rewriting checkout for every vendor is painful.",
                    "جریان تسویه `capture(event, props)` می‌خواهد، اما SDK فروشنده فقط `trackEvent(name, stringPayload)` دارد. تغییر فروشنده ممکن نیست؛ بازنویسی تسویه برای هر فروشنده دردناک است.",
                    "Without an anti-corruption layer, vendor types leak into domain services, forcing widespread edits when you swap providers or upgrade major SDK versions.",
                    "بدون لایهٔ ضدفساد، نوع‌های فروشنده به سرویس‌های دامنه نشت می‌کنند و تعویض ارائه‌دهنده یا ارتقای major SDK را پرهزینه می‌کنند.",
                    "The risk is semantic drift: adapters that silently coerce types can hide data loss. You need an explicit translation boundary with tests around mapping rules.",
                    "ریسک انحراف معنایی است: آداپترهایی که بی‌صدا نوع را coerce می‌کنند ممکن است از دست رفتن داده را پنهان کنند. به مرز ترجمهٔ صریح با تست روی قواعد نگاشت نیاز دارید."
                ),
                Section(
                    "analogy",
                    "Real-world analogy", "تشابه دنیای واقعی",
                    "A travel plug adapter lets your laptop charger fit a foreign socket. Neither the charger nor the wall outlet changes.",
                    "آداپتر برق مسافرتی شارژر لپ‌تاپ را به پریز خارجی وصل می‌کند. نه شارژر عوض می‌شود نه پریز دیوار.",
                    "An interpreter at a conference translates statements without rewriting the speaker's talk or the audience's language preference.",
                    "مترجم در کنفرانس گفته‌ها را ترجمه می‌کند بدون بازنویسی سخنرانی یا تغییر زبان مخاطب.",
                    "Like a protocol converter in networking: frames are rewritten at the edge so internal services keep a stable contract while external peers differ.",
                    "مانند مبدل پروتکل در شبکه: فریم‌ها در لبه بازنویسی می‌شوند تا سرویس‌های داخلی قرارداد پایدار نگه دارند در حالی که همتایان خارجی متفاوت‌اند."
                ),
                Section(
                    "solution",
                    "Solution", "راه‌حل",
                    "Define the interface your app needs. Implement it in an adapter class that holds the legacy object and translates each call.",
                    "واسط مورد نیاز اپ را تعریف کنید. آن را در کلاس آداپتر پیاده کنید که شیء قدیمی را نگه می‌دارد و هر فراخوانی را ترجمه می‌کند.",
                    "Keep mapping logic inside the adapter. Clients depend on the port interface; compose the adapter at the composition root.",
                    "منطق نگاشت را داخل آداپتر نگه دارید. کلاینت‌ها به واسط پورت وابسته‌اند؛ آداپتر را در composition root بسازید.",
                    "Object adapters (composition) are usually safer in TypeScript than class adapters (multiple inheritance style). Add validation where coercion can lose information.",
                    "آداپتر شیء (ترکیب) معمولاً در TypeScript امن‌تر از آداپتر کلاس است. جایی که coerce ممکن است اطلاعات از دست بدهد اعتبارسنجی اضافه کنید."
                ),
                Section(
                    "structure",
                    "Structure overview", "نمای ساختار",
                    "Client → Target interface ← Adapter → Adaptee. The adapter implements Target and delegates to Adaptee.",
                    "کلاینت ← واسط Target ← Adapter ← Adaptee. آداپتر Target را پیاده می‌کند و به Adaptee واگذار می‌کند.",
                    "Participants: Client, Target, Adapter, Adaptee. Two-way adapters exist but increase complexity—document direction clearly.",
                    "شرکت‌کنندگان: Client، Target، Adapter، Adaptee. آداپتر دوطرفه وجود دارد اما پیچیدگی را بالا می‌برد—جهت را واضح مستند کنید.",
                    "In ports-and-adapters architecture, Adapter is the infrastructure implementor of a domain port. Keep domain free of adaptee types.",
                    "در معماری پورت‌وآداپتر، Adapter پیاده‌ساز زیرساختی پورت دامنه است. دامنه را از نوع‌های adaptee پاک نگه دارید.",
                    code: code,
                    walkJuniorEn: "`LegacyTrackerAdapter` implements `AnalyticsPort` and converts props to strings before calling the legacy SDK. `checkout` never imports LegacyTracker.",
                    walkJuniorFa: "`LegacyTrackerAdapter` واسط `AnalyticsPort` را پیاده می‌کند و props را قبل از فراخوانی SDK به رشته تبدیل می‌کند. `checkout` هرگز LegacyTracker را import نمی‌کند.",
                    walkMidEn: "The mapping loop is the anti-corruption layer. If a vendor changes payload rules, you update one adapter class and re-run adapter unit tests.",
                    walkMidFa: "حلقهٔ نگاشت لایهٔ ضدفساد است. اگر فروشنده قواعد payload را عوض کند، یک کلاس آداپتر و تست‌های واحد آن را به‌روز می‌کنید.",
                    walkSeniorEn: "Consider whether `String(v)` is acceptable. Senior designs may reject non-stringifiable values or use a schema mapper to avoid silent precision loss.",
                    walkSeniorFa: "بررسی کنید آیا `String(v)` قابل قبول است. طراحی ارشد ممکن است مقادیر غیرقابل‌رشته را رد کند یا از mapper اسکیما استفاده کند تا دقت بی‌صدا از دست نرود."
                ),
                Section(
                    "when",
                    "When to use / not use", "کی استفاده کنیم / نکنیم",
                    "Use when you must integrate an existing class with an incompatible interface. Skip when you can change both sides to share one interface.",
                    "وقتی باید کلاس موجود را با واسط ناسازگار یکپارچه کنید استفاده کنید. اگر هر دو طرف را می‌توانید به یک واسط برسانید، لازم نیست.",
                    "Use during migrations and vendor swaps. Avoid creating adapters for every tiny helper—sometimes a one-line mapper function is enough.",
                    "هنگام مهاجرت و تعویض فروشنده استفاده کنید. برای هر هلپر کوچک آداپتر نسازید—گاهی یک تابع نگاشت یک‌خطی کافی است.",
                    "Use when the target contract is stable and owned by your domain. Do not use Adapter to hide bad domain modeling or to accumulate unrelated SDK features.",
                    "وقتی قرارداد هدف پایدار و در مالکیت دامنه است استفاده کنید. آداپتر را برای پنهان‌کردن مدل‌سازی ضعیف دامنه یا انباشتن فیچرهای نامرتبط SDK به کار نبرید."
                ),
                Section(
                    "proscons",
                    "Pros and cons", "مزایا و معایب",
                    "Pros: reuse legacy code, keep app interfaces clean. Cons: extra layer, mapping bugs possible.",
                    "مزایا: استفاده مجدد از کد قدیمی، تمیز ماندن واسط‌های اپ. معایب: لایهٔ اضافه، احتمال باگ نگاشت.",
                    "Pros: isolates third-party churn. Cons: proliferation of adapters, duplicated mapping if not centralized.",
                    "مزایا: نوسان ثالث را جدا می‌کند. معایب: زیاد شدن آداپترها، نگاشت تکراری اگر متمرکز نشود.",
                    "Pros: enables hexagonal boundaries and safer upgrades. Cons: indirection and the temptation to over-translate instead of negotiating a better upstream API.",
                    "مزایا: مرزهای شش‌ضلعی و ارتقای امن‌تر. معایب: غیرمستقیم بودن و وسوسهٔ ترجمه‌افراطی به‌جای مذاکره برای API بالادستی بهتر."
                ),
                Section(
                    "similar",
                    "Similar patterns", "الگوهای مشابه",
                    "Facade simplifies a subsystem; Decorator adds behavior; Bridge separates abstraction from implementation.",
                    "Facade یک زیرسیستم را ساده می‌کند؛ Decorator رفتار اضافه می‌کند؛ Bridge انتزاع را از پیاده‌سازی جدا می‌کند.",
                    "Proxy controls access to the same interface; Adapter changes the interface. Bridge is planned upfront; Adapter often arrives later.",
                    "Proxy دسترسی به همان واسط را کنترل می‌کند؛ Adapter واسط را عوض می‌کند. Bridge از ابتدا طراحی می‌شود؛ Adapter اغلب دیرتر می‌آید.",
                    "In practice, an adapter may also act as a facade for a chatty SDK—keep responsibilities documented so the class does not become a dumping ground.",
                    "در عمل آداپتر ممکن است برای SDK پرحرف نقش facade هم بگیرد—مسئولیت‌ها را مستند کنید تا کلاس زباله‌دان نشود."
                )
            ],
            [
                Q("ad-j1", "junior", "quiz",
                    "What is the Adapter's main job?",
                    "کار اصلی Adapter چیست؟",
                    ["Translate one interface into another the client expects", "Speed up sorting algorithms", "Manage CSS layout", "Create UI themes"],
                    ["ترجمهٔ یک واسط به واسطی که کلاینت انتظار دارد", "سریع‌تر کردن الگوریتم‌های مرتب‌سازی", "مدیریت چیدمان CSS", "ساخت تم UI"],
                    0,
                    "Adapter resolves interface mismatch between client and adaptee.",
                    "آداپتر ناهماهنگی واسط بین کلاینت و adaptee را حل می‌کند.",
                    15),
                Q("ad-j2", "junior", "quiz",
                    "In the example, who should import LegacyTracker?",
                    "در مثال، چه کسی باید LegacyTracker را import کند؟",
                    ["Only the adapter (and composition root)", "Every checkout function", "The AnalyticsPort interface file", "The CSS bundle"],
                    ["فقط آداپتر (و composition root)", "هر تابع checkout", "فایل واسط AnalyticsPort", "باندل CSS"],
                    0,
                    "Keeping the legacy type behind the adapter prevents leakage into domain code.",
                    "نگه‌داشتن نوع قدیمی پشت آداپتر از نشت به کد دامنه جلوگیری می‌کند.",
                    15),
                Q("ad-m1", "mid", "challenge",
                    "You switch analytics vendors. What should ideally stay unchanged?",
                    "فروشندهٔ آنالیتیکس عوض می‌شود. در حالت ایده‌آل چه چیزی ثابت بماند؟",
                    ["Checkout code depending on AnalyticsPort", "All call sites hard-coded to the old SDK", "The old vendor package forever", "Removing the port interface"],
                    ["کد checkout وابسته به AnalyticsPort", "همهٔ call siteهای hard-code به SDK قدیمی", "پکیج فروشندهٔ قدیمی برای همیشه", "حذف واسط پورت"],
                    0,
                    "The port stays stable; you swap adapter implementations.",
                    "پورت پایدار می‌ماند؛ پیاده‌سازی آداپتر را عوض می‌کنید.",
                    25),
                Q("ad-m2", "mid", "quiz",
                    "Adapter vs Facade—which statement is most accurate?",
                    "Adapter در برابر Facade—کدام جمله دقیق‌تر است؟",
                    ["Adapter focuses on interface conversion; Facade focuses on simplifying a subsystem", "They are the same pattern", "Facade always wraps one method", "Adapter only works with databases"],
                    ["تمرکز Adapter تبدیل واسط است؛ تمرکز Facade ساده‌سازی زیرسیستم", "یک الگو هستند", "Facade همیشه یک متد را wrap می‌کند", "Adapter فقط با پایگاه‌داده کار می‌کند"],
                    0,
                    "Both may wrap other objects, but their intents differ.",
                    "هر دو ممکن است اشیاء دیگر را wrap کنند، اما نیت‌شان فرق دارد.",
                    25),
                Q("ad-s1", "senior", "challenge",
                    "Your adapter stringifies every property. A money amount loses currency metadata. Best response?",
                    "آداپتر همهٔ propertyها را رشته می‌کند و مبلغ پول متادیتای ارز را از دست می‌دهد. بهترین واکنش؟",
                    ["Tighten the mapping with an explicit schema and validation", "Ignore it—stringification is always fine", "Delete AnalyticsPort", "Move LegacyTracker into the domain model"],
                    ["نگاشت را با اسکیما و اعتبارسنجی صریح محکم کنید", "نادیده بگیرید—رشته‌سازی همیشه خوب است", "AnalyticsPort را حذف کنید", "LegacyTracker را به مدل دامنه ببرید"],
                    0,
                    "Adapters must preserve semantics, not only make TypeScript compile.",
                    "آداپتر باید معنا را حفظ کند، نه فقط TypeScript را compile کند.",
                    35),
                Q("ad-s2", "senior", "quiz",
                    "Why are object adapters (composition) often preferred in TypeScript?",
                    "چرا آداپترهای شیء (ترکیب) اغلب در TypeScript ترجیح داده می‌شوند؟",
                    ["TS has no multiple inheritance; composition wraps the adaptee cleanly", "Composition is illegal in TS", "Class adapters are faster by language law", "Object adapters cannot implement interfaces"],
                    ["TS وراثت چندگانه ندارد؛ ترکیب adaptee را تمیز wrap می‌کند", "ترکیب در TS غیرقانونی است", "آداپتر کلاس طبق قانون زبان سریع‌تر است", "آداپتر شیء نمی‌تواند واسط پیاده کند"],
                    0,
                    "Composition fits TS/JS language constraints and keeps wrapping explicit.",
                    "ترکیب با محدودیت‌های زبان TS/JS سازگار است و wrapping را صریح نگه می‌دارد.",
                    35)
            ],
            ["facade", "decorator", "bridge"],
            false
        );
    }

    private static PatternDetailDto BuildObserver()
    {
        const string code = """
            type Listener<T> = (value: T) => void;

            class EventBus<T> {
              private listeners = new Set<Listener<T>>();

              subscribe(listener: Listener<T>): () => void {
                this.listeners.add(listener);
                return () => this.listeners.delete(listener);
              }

              publish(value: T) {
                for (const listener of [...this.listeners]) {
                  listener(value);
                }
              }
            }

            // Subject: order status
            const orderEvents = new EventBus<'pending' | 'paid' | 'shipped'>();

            // Observers
            const unsubscribeUi = orderEvents.subscribe((status) => {
              console.log(`UI badge: ${status}`);
            });

            orderEvents.subscribe((status) => {
              if (status === 'paid') console.log('Send receipt email');
            });

            orderEvents.publish('paid');
            unsubscribeUi();
            """;

        return new PatternDetailDto(
            "observer",
            "behavioral",
            T("Observer", "ناظر"),
            T(
                "Define a one-to-many dependency so when one object changes state, dependents are notified automatically.",
                "وابستگی یک‌به‌چند تعریف کنید تا وقتی یک شیء تغییر حالت می‌دهد، وابسته‌ها خودکار مطلع شوند."
            ),
            T(
                "Publish changes to many listeners without hard-wiring them together.",
                "تغییرات را به شنوندگان زیاد اعلام کنید بدون سیم‌کشی سخت بین آن‌ها."
            ),
            [
                Section(
                    "intro",
                    "Introduction", "مقدمه",
                    "Observer lets one subject notify many interested objects when something happens. Listeners subscribe, react, and can unsubscribe later.",
                    "ناظر اجازه می‌دهد یک subject وقتی چیزی رخ می‌دهد به اشیاء علاقه‌مند خبر دهد. شنوندگان subscribe می‌کنند، واکنش می‌دهند و بعداً unsubscribe می‌کنند.",
                    "Observer decouples publishers from concrete subscribers. It is the backbone of UI reactivity, event buses, and many reactive streams.",
                    "ناظر ناشران را از مشترکین مشخص جدا می‌کند. ستون فقرات واکنش‌پذیری UI، event busها و بسیاری از جریان‌های واکنشی است.",
                    "At senior level, treat Observer as a contract about timing, error isolation, and teardown. Memory leaks from forgotten unsubscribes are the classic failure mode.",
                    "در سطح ارشد، Observer را قرارداد زمان‌بندی، ایزوله خطا و teardown ببینید. نشت حافظه از unsubscribe فراموش‌شده حالت شکست کلاسیک است."
                ),
                Section(
                    "problem",
                    "Problem", "مسئله",
                    "An order becomes paid. The UI badge, email service, and analytics all need to know. If the order class calls each one directly, it becomes a tangled hub.",
                    "سفارش پرداخت می‌شود. بج UI، سرویس ایمیل و آنالیتیکس همه باید بدانند. اگر کلاس سفارش هرکدام را مستقیم صدا بزند، به هاب درهم تبدیل می‌شود.",
                    "Direct calls create compile-time coupling and force the subject to know every side effect. Adding a new reaction means editing the subject repeatedly.",
                    "فراخوانی مستقیم جفت‌شدگی زمان کامپایل می‌سازد و subject را مجبور می‌کند همهٔ عوارض جانبی را بشناسد. واکنش جدید یعنی ویرایش مکرر subject.",
                    "Without disciplined notification semantics you risk re-entrancy (observer mutates subject mid-notify), inconsistent snapshots, and cascading performance issues.",
                    "بدون معناشناسی منظم اعلان، خطر بازورود (observer وسط notify موضوع را عوض کند)، اسنپ‌شات ناهماهنگ و مشکلات عملکرد آبشاری وجود دارد."
                ),
                Section(
                    "analogy",
                    "Real-world analogy", "تشابه دنیای واقعی",
                    "You subscribe to a newsletter. When a new issue is published, every subscriber gets it. You can unsubscribe without the publisher rewriting its press.",
                    "در خبرنامه عضو می‌شوید. وقتی شمارهٔ جدید منتشر می‌شود همهٔ مشترکین می‌گیرند. می‌توانید لغو عضویت کنید بدون اینکه ناشر متنش را عوض کند.",
                    "A town bell rings after an announcement decision; shops and citizens react independently based on their own responsibilities.",
                    "زنگ شهر بعد از تصمیم اعلام به صدا درمی‌آید؛ مغازه‌ها و شهروندان مستقل بر اساس مسئولیت خود واکنش می‌دهند.",
                    "Like a message topic in pub/sub infrastructure: producers emit facts; consumers opt in with their own scaling and failure domains.",
                    "مانند topic در زیرساخت pub/sub: تولیدکننده‌ها واقعیت را منتشر می‌کنند؛ مصرف‌کننده‌ها با دامنهٔ مقیاس و خطای خود عضو می‌شوند."
                ),
                Section(
                    "solution",
                    "Solution", "راه‌حل",
                    "Give the subject subscribe/unsubscribe/publish methods. Observers register callbacks. When state changes, the subject notifies all current listeners.",
                    "به subject متدهای subscribe/unsubscribe/publish بدهید. ناظرها callback ثبت می‌کنند. با تغییر حالت، subject همهٔ شنوندگان فعلی را خبر می‌دهد.",
                    "Store listeners in a set, copy before iterating, and return an unsubscribe function. Keep observers focused on one reaction each.",
                    "شنوندگان را در set نگه دارید، قبل از پیمایش کپی کنید و تابع unsubscribe برگردانید. هر ناظر روی یک واکنش متمرکز بماند.",
                    "Define delivery guarantees (sync vs async), error policies (isolate per listener), and backpressure if using streams. Prefer typed events over stringly-typed megabuses.",
                    "ضمانت تحویل (همگام/ناهمگام)، سیاست خطا (ایزوله per listener) و backpressure در صورت stream را تعریف کنید. eventهای تایپ‌شده را به busهای رشته‌ای ترجیح دهید."
                ),
                Section(
                    "structure",
                    "Structure overview", "نمای ساختار",
                    "Subject maintains a list of observers. Observers implement a update/listen method. Client attaches observers to the subject.",
                    "Subject فهرست ناظرها را نگه می‌دارد. ناظرها متد update/listen دارند. کلاینت ناظرها را به subject وصل می‌کند.",
                    "Push vs pull: push sends data in the notification; pull sends a signal and observers query the subject. EventBus is a common push-style variant.",
                    "Push در برابر pull: push داده را در اعلان می‌فرستد؛ pull سیگنال می‌دهد و ناظرها از subject می‌پرسند. EventBus گونهٔ رایج push است.",
                    "Compare with reactive libraries (RxJS): Operator pipelines add cancellation, scheduling, and composition on top of the Observer idea.",
                    "با کتابخانه‌های واکنشی (RxJS) مقایسه کنید: پایپ‌لاین اپراتورها لغو، زمان‌بندی و ترکیب را روی ایدهٔ Observer اضافه می‌کنند.",
                    code: code,
                    walkJuniorEn: "`subscribe` adds a listener and returns unsubscribe. `publish` notifies everyone. After `unsubscribeUi()`, the UI listener stops receiving events.",
                    walkJuniorFa: "`subscribe` شنونده اضافه می‌کند و unsubscribe برمی‌گرداند. `publish` به همه خبر می‌دهد. بعد از `unsubscribeUi()` شنونده UI دیگر رویداد نمی‌گیرد.",
                    walkMidEn: "Copying `this.listeners` before iteration avoids surprises if a listener unsubscribes during notify. Each observer stays a small closure with one job.",
                    walkMidFa: "کپی `this.listeners` قبل از حلقه از غافلگیری وقتی شنونده وسط notify لغو عضویت می‌کند جلوگیری می‌کند. هر ناظر یک closure کوچک با یک کار است.",
                    walkSeniorEn: "This sync bus does not isolate exceptions—one throwing listener can stop later ones. Production buses often wrap listener calls in try/catch or queue microtasks.",
                    walkSeniorFa: "این bus همگام استثنا را ایزوله نمی‌کند—یک شنوندهٔ پرتاب‌کننده می‌تواند بقیه را متوقف کند. busهای تولیدی اغلب فراخوانی را در try/catch یا microtask می‌گذارند."
                ),
                Section(
                    "when",
                    "When to use / not use", "کی استفاده کنیم / نکنیم",
                    "Use when many objects must react to one object's events. Skip when only one hard dependency exists—a direct call is clearer.",
                    "وقتی اشیاء زیاد باید به رویدادهای یک شیء واکنش دهند استفاده کنید. اگر فقط یک وابستگی سخت دارید، فراخوانی مستقیم واضح‌تر است.",
                    "Use for UI state fan-out and cross-module notifications. Avoid a global god-bus that carries unrelated events without boundaries.",
                    "برای پخش حالت UI و اعلان بین‌ماژولی استفاده کنید. از bus خدای سراسری با رویدادهای نامرتبط بدون مرز اجتناب کنید.",
                    "Use when subscribers are dynamic and unknown to the publisher. Prefer explicit calls or messaging with clearer ownership when the dependency graph is stable and small.",
                    "وقتی مشترکین پویا و برای ناشر ناشناخته‌اند استفاده کنید. وقتی گراف وابستگی پایدار و کوچک است فراخوانی صریح یا پیام‌رسانی با مالکیت روشن‌تر را ترجیح دهید."
                ),
                Section(
                    "proscons",
                    "Pros and cons", "مزایا و معایب",
                    "Pros: loose coupling, dynamic subscription. Cons: notification order can be surprising; leaks if you forget to unsubscribe.",
                    "مزایا: جفت‌شدگی سست، عضویت پویا. معایب: ترتیب اعلان ممکن است غافلگیرکننده باشد؛ نشت اگر unsubscribe فراموش شود.",
                    "Pros: open for new reactions. Cons: harder debugging of event storms; implicit control flow.",
                    "مزایا: باز برای واکنش‌های جدید. معایب: دیباگ طوفان رویداد سخت‌تر؛ جریان کنترل ضمنی.",
                    "Pros: scales fan-out cleanly. Cons: requires policies for errors, ordering, and lifecycle; easy to recreate coupling via shared event bags.",
                    "مزایا: fan-out را تمیز مقیاس می‌دهد. معایب: نیاز به سیاست خطا، ترتیب و چرخهٔ حیات؛ آسان است جفت‌شدگی از طریق کیسهٔ رویداد مشترک برگردد."
                ),
                Section(
                    "similar",
                    "Similar patterns", "الگوهای مشابه",
                    "Publish-Subscribe, Mediator, and reactive streams relate closely. MVC views often observe models.",
                    "Publish-Subscribe، Mediator و جریان‌های واکنشی نزدیک‌اند. در MVC معمولاً view مدل را observe می‌کند.",
                    "Mediator centralizes communication; Observer is direct subject-to-observers. Pub/Sub often adds channels between them.",
                    "Mediator ارتباط را متمرکز می‌کند؛ Observer ارتباط مستقیم subject به ناظرهاست. Pub/Sub اغلب کانال میانی اضافه می‌کند.",
                    "CQRS/event-driven designs push Observer ideas to infrastructure. Inside an app, choose the lightest event tool that preserves teardown discipline.",
                    "طراحی‌های CQRS/event-driven ایدهٔ Observer را به زیرساخت می‌برند. داخل اپ، سبک‌ترین ابزار رویداد را انتخاب کنید که انضباط teardown را حفظ کند."
                )
            ],
            [
                Q("ob-j1", "junior", "quiz",
                    "What does subscribe typically return in a careful Observer API?",
                    "در API مراقب Observer، subscribe معمولاً چه برمی‌گرداند؟",
                    ["An unsubscribe function", "A CSS class name", "A database connection", "A sorted array"],
                    ["یک تابع unsubscribe", "نام کلاس CSS", "اتصال پایگاه‌داده", "آرایهٔ مرتب"],
                    0,
                    "Returning unsubscribe helps callers avoid leaks.",
                    "برگرداندن unsubscribe به جلوگیری از نشت کمک می‌کند.",
                    15),
                Q("ob-j2", "junior", "quiz",
                    "After an order is paid, why notify observers instead of hard-coding email + UI calls in Order?",
                    "بعد از پرداخت سفارش، چرا به‌جای hard-code ایمیل و UI داخل Order به ناظرها خبر دهیم؟",
                    ["So new reactions can be added without editing Order each time", "Because email cannot be called from TypeScript", "To make the program slower on purpose", "Observers replace unit tests"],
                    ["تا واکنش‌های جدید بدون ویرایش مکرر Order اضافه شوند", "چون ایمیل از TypeScript قابل‌فراخوانی نیست", "برای کند کردن عمدی برنامه", "ناظرها جایگزین تست واحد می‌شوند"],
                    0,
                    "Observer keeps the subject open for extension by new listeners.",
                    "ناظر subject را برای گسترش با شنوندگان جدید باز نگه می‌دارد.",
                    15),
                Q("ob-m1", "mid", "challenge",
                    "A listener unsubscribes during publish. What defensive technique helps?",
                    "یک شنونده وسط publish لغو عضویت می‌کند. کدام تکنیک دفاعی کمک می‌کند؟",
                    ["Iterate over a copy/snapshot of listeners", "Disable TypeScript", "Never allow unsubscribe", "Store listeners in CSS"],
                    ["روی کپی/اسنپ‌شات شنوندگان پیمایش کنید", "TypeScript را خاموش کنید", "هرگز unsubscribe ندهید", "شنوندگان را در CSS نگه دارید"],
                    0,
                    "Snapshot iteration avoids concurrent modification surprises.",
                    "پیمایش اسنپ‌شات از غافلگیری تغییر همزمان جلوگیری می‌کند.",
                    25),
                Q("ob-m2", "mid", "quiz",
                    "Push vs pull observers—what is push style?",
                    "ناظر push در برابر pull—سبک push چیست؟",
                    ["The notification carries the data the observer needs", "Observers must always query a database", "Only CSS can push", "Push means no subscribers allowed"],
                    ["اعلان داده‌ای که ناظر نیاز دارد را همراه دارد", "ناظرها همیشه باید از پایگاه‌داده بپرسند", "فقط CSS می‌تواند push کند", "Push یعنی هیچ مشترکی مجاز نیست"],
                    0,
                    "Push sends state/events in the notification payload.",
                    "Push حالت/رویداد را در payload اعلان می‌فرستد.",
                    25),
                Q("ob-s1", "senior", "challenge",
                    "One listener throws during sync notify and blocks others. Best hardening?",
                    "یک شنونده وسط notify همگام پرتاب می‌کند و بقیه را مسدود می‌کند. بهترین مقاوم‌سازی؟",
                    ["Isolate listener errors (try/catch or async queue) so others still run", "Remove unsubscribe support", "Put all logic inside the subject again", "Ban Observer in TypeScript"],
                    ["خطای شنونده را ایزوله کنید (try/catch یا صف async) تا بقیه اجرا شوند", "پشتیبانی unsubscribe را حذف کنید", "همهٔ منطق را دوباره داخل subject بگذارید", "Observer را در TypeScript ممنوع کنید"],
                    0,
                    "Production-grade buses isolate failures per subscriber.",
                    "busهای سطح تولید شکست را per subscriber ایزوله می‌کنند.",
                    35),
                Q("ob-s2", "senior", "quiz",
                    "Advanced: when is a global untyped event bus a design smell?",
                    "پیشرفته: کی bus رویداد سراسری بدون نوع بوی طراحی بد است؟",
                    ["When unrelated domains share one bag of string events without boundaries", "When you have exactly one typed subject", "When unsubscribe is supported", "When used only in tests"],
                    ["وقتی دامنه‌های نامرتبط یک کیسه رویداد رشته‌ای بدون مرز را شریکند", "وقتی دقیقاً یک subject تایپ‌شده دارید", "وقتی unsubscribe پشتیبانی می‌شود", "وقتی فقط در تست‌ها استفاده می‌شود"],
                    0,
                    "Unbounded god-buses recreate coupling and hide ownership.",
                    "busهای خدای بی‌مرز جفت‌شدگی را برمی‌گردانند و مالکیت را پنهان می‌کنند.",
                    40,
                    true)
            ],
            ["mediator", "publish-subscribe"],
            true
        );
    }
}
