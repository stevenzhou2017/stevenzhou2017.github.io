# C指针返回与C++值返回的接口对比

author: 周均扬

date: 2026.07.30

---

C 也可以返回结构体值，C++ 也可以返回裸指针、引用或智能指针。

这里真正比较的是两种接口设计方式：

* **指针返回**：函数返回一个内存地址，由调用者通过地址访问对象。
* **值返回**：函数返回一个完整对象，调用者获得独立对象语义。

两者最根本的差异不是“返回时复制了多少字节”，而是：**对象的生命周期、所有权和资源释放责任由谁表达、由谁管理。**



## 1. C 指针返回：返回的是地址，不是对象

典型示例：

```c
#include <stdlib.h>
#include <string.h>

char* make_buffer(void)
{
    char* p = malloc(128);
    if (p == NULL) {
        return NULL;
    }

    strcpy(p, "hello");
    return p;
}

int main(void)
{
    char* buffer = make_buffer();

    if (buffer != NULL) {
        /* 使用 buffer */
        free(buffer);
    }

    return 0;
}
```

`make_buffer()`实际返回的是一个地址值。

可以把执行过程理解为：

```text
make_buffer 栈帧
┌─────────────────┐
│ p = 0x1000      │ ───────┐
└─────────────────┘        │
                           ▼
堆内存
地址 0x1000
┌─────────────────┐
│ "hello"         │
└─────────────────┘
```

函数返回后：

* 局部指针变量 `p` 被销毁；
* `p` 中保存的地址值被复制给调用者；
* `malloc()` 分配的堆对象仍然存在；
* 调用者必须在适当时机调用 `free()`。

因此，指针变量的生命周期和它所指对象的生命周期是两回事。

### 1. 指针本身不是对象所有权

下面几个函数都返回 `char*`，但语义完全不同：

```c
char* create_buffer(void);          // 可能要求调用者 free
char* get_global_buffer(void);      // 可能指向全局对象，不能 free
char* get_internal_buffer(void);    // 可能借用内部缓存
char* find_item(Container* c);      // 可能指向容器内部元素
```

从类型 `char*` 本身看不出来：

* 是否拥有对象；
* 是否需要释放；
* 应该使用 `free()` 还是其他释放函数；
* 指针有效到什么时候；
* 是否允许修改；
* 是否允许长期保存；
* 是否可能为空。

所以 C 接口通常必须依赖：

* 函数命名；
* 注释和文档；
* API约定；
* 配套释放函数；
* 错误码；
* 项目编码规范。

例如：

```c
Image* image_create(void);
void image_destroy(Image* image);
```

这里通过成对函数表达所有权。

---

## 2. C 指针返回的几种生命周期模型

### 1. 返回堆对象：调用者负责释放

```c
int* create_value(void)
{
    int* p = malloc(sizeof(int));

    if (p != NULL) {
        *p = 100;
    }

    return p;
}
```

调用：

```c
int* value = create_value();

if (value != NULL) {
    printf("%d\n", *value);
    free(value);
}
```

生命周期：

```text
malloc
  ↓
对象创建
  ↓
返回地址
  ↓
调用者使用
  ↓
free
  ↓
对象生命周期结束
```

主要风险：

* 忘记释放：内存泄漏；
* 重复释放：double free；
* 释放后继续使用：use-after-free；
* 多个指针不知道谁负责释放；
* 使用了错误的释放函数。

---

### 2. 返回局部变量地址：错误

```c
int* bad_function(void)
{
    int value = 100;
    return &value;
}
```

`value` 位于函数栈帧中：

```text
调用期间：

bad_function 栈帧
┌─────────────────┐
│ value = 100     │
└─────────────────┘
        ▲
        │
返回 &value
```

函数结束后，栈帧失效：

```text
函数返回后：

原 value 地址
┌─────────────────┐
│ 已失效/可被覆盖 │
└─────────────────┘
```

调用者获得的是悬垂指针。

```c
int* p = bad_function();
printf("%d\n", *p);  // 未定义行为
```

关键点是：

> 地址值可以被成功返回，但地址对应的对象已经不存在。

---

### 3. 返回静态对象地址

```c
char* get_buffer(void)
{
    static char buffer[128];
    return buffer;
}
```

这里不会产生悬垂指针，因为静态对象具有静态存储期，通常一直存在到进程结束。

但它仍有明显问题：

* 多次调用共享同一块内存；
* 后一次调用可能覆盖前一次结果；
* 多线程下可能发生数据竞争；
* 调用者不能 `free()`；
* 调用者可能错误地长期依赖内部状态。

例如：

```c
char* a = get_buffer();
char* b = get_buffer();
```

`a` 和 `b` 很可能指向同一个对象。

---

### 4. 返回借用指针

```c
typedef struct {
    char name[64];
} User;

char* user_name(User* user)
{
    return user->name;
}
```

返回的指针不是新对象，而是指向 `User` 内部成员。

它的有效期依赖于：

```text
user 对象生命周期
        ↓
user->name 生命周期
        ↓
返回指针生命周期上限
```

如果 `user` 被销毁，返回的指针也立即失效。

---

## 3. C++ 值返回：返回的是对象语义

典型示例：

```cpp
#include <string>

std::string make_string()
{
    std::string result = "hello";
    return result;
}

int main()
{
    std::string text = make_string();
}
```

从语言语义看，`make_string()`返回的是一个 `std::string` 对象，而不是指向字符串对象的裸地址。

调用者获得：

* 独立的对象；
* 明确的析构行为；
* 自动管理的资源；
* 由类型定义的复制或移动语义。

离开作用域时：

```cpp
{
    std::string text = make_string();
    // 使用 text
}   // 自动调用 text.~basic_string()
```

`std::string` 的析构函数会自动释放其内部资源。

这就是 RAII：

> Resource Acquisition Is Initialization，资源获取即初始化。

资源的获取和释放绑定在对象构造与析构上。

---

## 4. C++ 值返回通常不会产生“一次完整深拷贝”

很多人误认为：

```cpp
std::string text = make_string();
```

一定经历：

```text
函数内构造 result
        ↓
复制 result 到临时对象
        ↓
复制临时对象到 text
        ↓
销毁多个临时对象
```

现代 C++ 中通常不是这样。

主要有三类机制：

1. RVO；
2. NRVO；
3. 移动语义。

---

## 5. RVO：直接构造到调用者的目标位置

RVO 是 Return Value Optimization。

例如：

```cpp
Widget create_widget()
{
    return Widget(10, 20);
}

Widget object = create_widget();
```

逻辑上似乎存在一个返回临时对象，但编译器通常直接在 `object` 的存储位置上构造：

```text
调用者预留 object 内存
            ↓
create_widget 直接在该内存构造 Widget
            ↓
object 构造完成
```

概念上相当于：

```cpp
// 伪代码，不是真实源码
create_widget(&object);
```

不会先在被调函数内构造一个对象，再复制出去。

从 C++17 开始，某些纯右值返回场景中的复制消除是语言规则保证的，而不仅仅是可选优化。

例如：

```cpp
Widget create_widget()
{
    return Widget{};
}
```

通常直接构造最终对象，不要求 `Widget` 必须具有可调用的复制构造函数。

---

## 6. NRVO：命名返回值优化

NRVO 是 Named Return Value Optimization。

```cpp
Widget create_widget()
{
    Widget result;
    result.initialize();
    return result;
}
```

`result` 是有名字的局部变量。

编译器可以让 `result` 从一开始就构造在调用者为返回值预留的内存中：

```text
调用者返回值槽位
┌──────────────────────┐
│ Widget object        │
└──────────────────────┘
          ▲
          │ result 实际直接在此构造
          │
create_widget()
```

因此，源代码中虽然写的是局部对象，但物理上可能根本不存在独立的局部副本。

需要注意：

* RVO 的部分场景在 C++17 后受到语言保证；
* NRVO 通常仍属于允许但不强制的优化；
* 主流编译器一般会积极进行 NRVO。

---

## 7. 不能消除返回对象时，通常使用移动语义

如果编译器不能执行 NRVO，通常会尝试移动：

```cpp
Widget create_widget(bool condition)
{
    Widget a;
    Widget b;

    if (condition) {
        return a;
    }

    return b;
}
```

因为有两个候选局部对象，NRVO 更难执行。

这时大致可能发生：

```text
局部对象 a 或 b
        ↓
调用移动构造函数
        ↓
返回目标对象
        ↓
局部对象析构
```

移动构造不是“移动内存地址”这么简单，而是由类型的移动构造函数决定如何转移资源。

例如 `std::vector` 移动时通常只需要转移：

* 数据指针；
* 元素数量；
* 容量。

不需要逐个复制所有元素。

```cpp
std::vector<int> make_vector()
{
    std::vector<int> values(1000000);
    return values;
}
```

即使不能执行 NRVO，移动一个 `std::vector` 通常也远低于深拷贝一百万个元素的成本。

---

## 8. 不要随意写 `return std::move(local)`

下面的写法通常不推荐：

```cpp
std::string make_string()
{
    std::string result = "hello";
    return std::move(result);
}
```

原因是显式 `std::move(result)` 把返回表达式从局部变量 `result` 改成了一个右值表达式，可能阻止编译器执行 NRVO。

优先写：

```cpp
return result;
```

编译器会按照顺序处理：

```text
优先尝试 NRVO
      ↓
不能 NRVO 时尝试移动
      ↓
不能移动时才考虑复制
```

因此，对局部返回对象通常无需手工添加 `std::move`。

---

## 9. 两种方式的核心差异

| 维度      | C 指针返回                | C++ 值返回              |
| ------- | --------------------- | -------------------- |
| 返回语义    | 返回地址值                 | 返回对象值                |
| 对象位置    | 可能在堆、静态区、调用者对象内部或其他区域 | 由对象语义和编译器决定          |
| 生命周期    | 依赖具体对象来源和接口约定         | 通常由作用域和析构函数管理        |
| 所有权     | 指针类型本身通常无法表达          | 类型、RAII和智能指针可明确表达    |
| 资源释放    | 常由调用者手工执行             | 对象析构时自动执行            |
| 错误风险    | 泄漏、悬垂、重复释放、错误释放       | 主要是错误的类型设计、昂贵复制或错误引用 |
| 空值      | 通常要判断 `NULL`          | 普通值对象通常总是有效对象        |
| 异常安全    | 需要人工清理已分配资源           | 栈展开时自动析构             |
| 性能认知    | 返回地址复制成本低             | RVO/NRVO后通常也没有额外复制   |
| API表达能力 | 高度依赖文档约定              | 类型系统可表达大部分语义         |
| 跨语言 ABI | 简单、稳定、普遍适用            | C++ ABI和对象布局更复杂      |
| 适用场景    | C API、驱动、嵌入式、跨语言接口    | 现代 C++ 业务对象、算法结果、容器  |

---

## 10. 内存位置并不是两者的根本区别

一个常见误区是：

```text
C 指针返回 = 堆内存
C++ 值返回 = 栈内存
```

这是不准确的。

## C 指针可以指向很多位置

```c
int* p1;  // 可能指向堆
int* p2;  // 可能指向全局对象
int* p3;  // 可能指向静态对象
int* p4;  // 可能指向调用者对象内部
int* p5;  // 甚至可能错误地指向已销毁栈对象
```

## C++ 值对象内部也可能使用堆内存

```cpp
std::vector<int> values;
```

`values` 对象本身可能位于栈上，但它管理的元素数组通常位于堆上：

```text
栈上 vector 对象
┌────────────────────┐
│ data pointer       │ ──────┐
│ size               │       │
│ capacity           │       │
└────────────────────┘       │
                             ▼
堆上元素数组
┌────────────────────────────┐
│ int int int int ...        │
└────────────────────────────┘
```

值返回返回的是完整的 `vector` 对象语义，但其内部资源仍可能位于堆中。

真正差异是：C++ 对象会通过构造、移动、复制和析构统一管理这些内部资源，而裸指针只表达一个地址。

---

## 11. 底层 ABI 实现：值返回有时也会偷偷使用指针

从机器和 ABI 层面看，值返回不一定意味着 CPU 把整个对象“压入返回寄存器”。

### 1. 小对象可能通过寄存器返回

例如：

```cpp
struct Point {
    int x;
    int y;
};

Point make_point()
{
    return {10, 20};
}
```

编译器可能使用一个或多个寄存器返回 `x` 和 `y`。

---

### 2. 大对象常使用隐藏返回地址

例如：

```cpp
BigObject create_object();
```

底层 ABI 可能转换为类似：

```cpp
// 概念伪代码
void create_object(BigObject* return_slot);
```

调用者先为返回对象分配空间：

```text
调用者
┌──────────────────────────┐
│ BigObject result         │
└──────────────────────────┘
             ▲
             │ 隐藏指针
             │
create_object(return_slot)
```

被调函数直接在该空间中构造对象。

这常称为：

* sret；
* hidden return pointer；
* return value slot。

所以底层可能仍然使用地址，但与 C 裸指针返回有本质差异：

#### C 指针返回

```text
地址本身就是公开接口语义
调用者要理解并管理该地址对应对象
```

#### C++ 值返回

```text
地址只是编译器和 ABI 的实现机制
调用者看到的仍然是对象值语义
生命周期和析构规则由语言保证
```

这是非常重要的区别：**底层都可能使用指针，但语言层暴露的抽象和责任完全不同。**

---

## 12. 所有权表达能力对比

### C 裸指针

```c
Data* get_data(void);
```

仅看声明，很难判断它是哪种语义：

```text
Data* get_data();
      │
      ├─ 新创建对象，需要调用者释放？
      ├─ 内部共享对象，不允许释放？
      ├─ 静态对象？
      ├─ 缓存对象？
      ├─ 可为空？
      └─ 只在下一次函数调用前有效？
```

需要额外文档。

### C++ 值与智能指针

```cpp
Data get_data();                         // 返回独立值
std::unique_ptr<Data> create_data();    // 独占所有权转移
std::shared_ptr<Data> share_data();     // 共享所有权
Data& access_data();                    // 借用可修改对象
const Data& view_data() const;          // 借用只读对象
Data* find_data();                      // 非拥有或可空，需要约定
```

不同类型明确表达不同语义。

| 返回类型                  | 常见语义           |
| --------------------- | -------------- |
| `T`                   | 返回一个独立值        |
| `std::unique_ptr<T>`  | 转移独占所有权        |
| `std::shared_ptr<T>`  | 共享所有权          |
| `T&`                  | 返回非空借用引用       |
| `const T&`            | 返回只读借用引用       |
| `T*`                  | 可空、通常非拥有，但仍需文档 |
| `std::optional<T>`    | 可能不存在的值        |
| `std::expected<T, E>` | 成功值或错误信息       |

---

## 13. 异常安全差异

## C 风格手工释放

```c
Resource* a = resource_create();
Resource* b = resource_create();

if (a == NULL || b == NULL) {
    resource_destroy(a);
    resource_destroy(b);
    return ERROR;
}

/* 后续任何错误路径都需要正确释放 a 和 b */
```

随着分支增加，清理逻辑会变得复杂。

常见写法是集中跳转清理：

```c
int process(void)
{
    int result = -1;
    Resource* a = NULL;
    Resource* b = NULL;

    a = resource_create();
    if (a == NULL) {
        goto cleanup;
    }

    b = resource_create();
    if (b == NULL) {
        goto cleanup;
    }

    result = 0;

cleanup:
    resource_destroy(b);
    resource_destroy(a);
    return result;
}
```

这在 C 中是合理而常见的资源管理模式。

### C++ RAII

```cpp
int process()
{
    Resource a;
    Resource b;

    perform_operation();

    return 0;
}
```

即使中途：

* 正常返回；
* 抛出异常；
* 某个构造失败；
* 提前离开作用域；

已成功构造的对象都会按逆序自动析构。

```text
构造 a
  ↓
构造 b
  ↓
发生异常
  ↓
析构 b
  ↓
析构 a
  ↓
异常继续传播
```

RAII 把错误路径上的资源释放责任交给语言机制。

---

## 14. 性能对比不能只看“指针复制”和“对象复制”

表面上：

```text
复制一个指针：通常 8 字节
复制一个大对象：可能非常昂贵
```

但真实成本必须综合分析。

### C 指针返回可能包含的成本

```text
malloc
  + 堆分配器锁竞争
  + 内存元数据维护
  + 缓存局部性下降
  + 指针间接访问
  + free
  + 所有权协调
```

例如：

```c
Result* calculate(void)
{
    Result* result = malloc(sizeof(Result));
    return result;
}
```

虽然返回指针本身很便宜，但对象动态分配可能更昂贵。

### C++ 值返回可能的真实成本

```text
调用者预留目标内存
  + 函数直接原地构造
  + 无额外 malloc
  + 无复制
  + 作用域结束析构
```

因此：

```cpp
Result calculate()
{
    Result result;
    return result;
}
```

经过 NRVO 后，可能比“堆分配后返回指针”更快。

值语义还通常带来更好的：

* 缓存局部性；
* 数据连续性；
* 编译器别名分析；
* 内联优化；
* 自动向量化机会；
* 并发隔离性。

---

## 15. 值语义有利于编译器优化

裸指针会带来别名问题。

```cpp
void update(int* a, int* b)
{
    *a = 10;
    *b = 20;
}
```

编译器必须考虑：

```text
a 和 b 是否指向同一位置？
```

如果可能别名，优化会受到限制。

值对象通常有更明确的独立性：

```cpp
Result transform(Input input);
```

编译器更容易判断：

* 对象是否独立；
* 数据是否可移动；
* 生命周期是否局部；
* 是否可消除临时对象；
* 是否可在寄存器中保存；
* 是否可内联展开。

所以现代高性能 C++ 并不是简单地“多用指针”，而往往是：尽量使用值语义，让编译器看到完整的对象生命周期和数据流。

---

## 16. 返回引用与返回指针的差异

C++ 中也可以返回引用：

```cpp
Data& get_data();
const Data& get_data() const;
```

引用通常表达：

* 一定存在对象；
* 不转移所有权；
* 调用者获得现有对象的别名。

但引用也存在生命周期风险：

```cpp
const std::string& bad()
{
    std::string value = "hello";
    return value;  // 悬垂引用
}
```

引用并不会自动延长普通局部变量的生命周期。

因此：

```text
值返回：获得独立对象
引用返回：借用现有对象
指针返回：通常表示可空借用，或特殊所有权语义
智能指针返回：显式表达动态对象所有权
```

---

## 17. 不同返回方式的设计选择

### 1. 返回普通值

适用于：

* 计算结果；
* 字符串；
* 容器；
* 配置对象；
* 小型结构体；
* 可移动的大对象；
* 需要独立生命周期的结果。

```cpp
std::string get_name();
std::vector<Point> detect_points();
Result calculate();
Configuration load_config();
```

这是现代 C++ 的默认选择。

---

### 2. 返回 `std::unique_ptr<T>`

适用于：

* 对象必须动态分配；
* 需要多态；
* 对象不可复制、不可移动；
* 创建者向调用者转移独占所有权；
* 对象大小或具体类型在编译期未知。

```cpp
std::unique_ptr<Base> create_algorithm()
{
    return std::make_unique<Derived>();
}
```

语义非常清晰：

```text
函数创建对象
      ↓
unique_ptr 所有权转移
      ↓
调用者成为唯一所有者
      ↓
unique_ptr 析构时自动 delete
```

---

### 3. 返回 `std::shared_ptr<T>`

适用于真正需要共享生命周期的场景：

```cpp
std::shared_ptr<Model> get_shared_model();
```

不应仅仅为了“避免复制”就使用 `shared_ptr`，因为它带来：

* 引用计数；
* 原子操作；
* 控制块；
* 更复杂的生命周期；
* 循环引用风险。

---

### 4. 返回引用或非拥有指针

适用于对象已经存在，函数只提供访问：

```cpp
const Configuration& configuration() const;
Device* find_device(DeviceId id);
```

这时必须保证被引用对象的生命周期覆盖使用期。

---

### 5. C 接口使用调用者提供缓冲区

为了避免动态分配，C 经常使用输出参数：

```c
int make_message(char* buffer, size_t capacity)
{
    const char* message = "hello";
    size_t required = strlen(message) + 1;

    if (capacity < required) {
        return -1;
    }

    memcpy(buffer, message, required);
    return 0;
}
```

调用者：

```c
char buffer[128];

if (make_message(buffer, sizeof(buffer)) == 0) {
    printf("%s\n", buffer);
}
```

优点：

* 内存由调用者控制；
* 不需要返回堆对象；
* 适合实时系统；
* 适合嵌入式；
* 适合稳定 C ABI。

代价是：

* 参数更多；
* 容量检查复杂；
* API 易出现缓冲区错误；
* 需要约定返回长度和截断行为。

---

## 18. 发展演进的底层逻辑

### 阶段一：C 的地址与手工资源管理

C 的设计目标包括：

* 接近硬件；
* 运行时开销低；
* ABI 简单；
* 内存布局可控；
* 适合操作系统和底层软件。

因此 C 提供的是基础机制：

```text
地址
指针
malloc/free
函数调用
结构体
```

语言不会自动推断：

* 谁拥有资源；
* 何时释放；
* 指针是否有效；
* 对象是否共享；
* 释放操作是否匹配。

优点是控制直接，缺点是责任全部落在程序员身上。

---

### 阶段二：早期 C++ 引入对象，但复制成本受到关注

C++ 引入：

* 构造函数；
* 析构函数；
* 封装；
* 对象值语义；
* 运算符重载。

但早期大型对象值返回可能涉及昂贵复制，因此历史上形成了很多习惯：

```cpp
void calculate(Result& output);
Result* create_result();
const Result& get_result();
```

这些习惯部分源自当时的：

* 编译器优化能力有限；
* 移动语义尚未出现；
* 标准库实现不成熟；
* 对复制成本的担忧。

---

### 阶段三：RVO/NRVO 降低返回复制成本

编译器逐步支持返回值优化，使对象能够直接构造到最终位置。

值返回从：

```text
语义自然，但可能昂贵
```

发展为：

```text
语义自然，而且通常没有额外复制
```

---

### 阶段四：C++11 引入移动语义

C++11 引入：

* 右值引用；
* 移动构造；
* 移动赋值；
* `std::move`；
* `std::unique_ptr`。

当复制不能消除时，可以转移资源而不是深拷贝。

资源管理模型从：

```text
复制全部资源
```

转变为：

```text
转移资源句柄
```

---

### 阶段五：现代 C++ 强化值语义与类型化所有权

现代 C++ 推荐：

```text
普通结果      → T
独占所有权    → unique_ptr<T>
共享所有权    → shared_ptr<T>
可选结果      → optional<T>
成功或失败    → expected<T, E>
借用访问      → T& / const T& / T*
```

发展方向是：把生命周期、所有权和错误语义编码进类型系统，而不是只写在注释中。

---

## 19. 两者真正的底层哲学差异

### C 指针模型

```text
函数返回地址
      ↓
调用者理解地址含义
      ↓
调用者追踪对象来源
      ↓
调用者决定何时释放
      ↓
依赖约定维持正确性
```

核心是：程序员管理地址和资源。

### C++ 值语义模型

```text
函数返回对象
      ↓
类型定义复制/移动规则
      ↓
编译器优化构造过程
      ↓
作用域控制生命周期
      ↓
析构函数释放资源
```

核心是：语言和类型系统管理对象生命周期，编译器优化底层搬运过程。

---

## 20. 典型误区

### 误区一：指针返回一定更快

不一定。

指针返回可能涉及堆分配，而值返回可能被完全消除复制。

应比较：

```text
堆分配 + 指针访问 + 释放
```

与：

```text
原地构造 + 自动析构
```

而不是只比较“8 字节地址”和“整个对象”。

---

### 误区二：值返回一定产生临时对象

不一定。

RVO/NRVO 可能让局部对象、返回对象和调用者对象成为同一个物理对象。

---

### 误区三：使用指针就意味着零拷贝

指针只意味着地址被复制。

对象是否发生过复制、序列化、分配或数据搬运取决于完整调用链。

---

### 误区四：返回值一定存储在栈上

不一定。

返回对象可能：

* 位于调用者栈帧；
* 位于寄存器；
* 位于某个外部对象内部；
* 被优化掉；
* 自身管理堆资源。

“值语义”描述的是语义，不等同于特定物理存储区域。

---

### 误区五：智能指针应替代所有值返回

不正确。

```cpp
std::unique_ptr<std::string> get_name();
```

通常不如：

```cpp
std::string get_name();
```

值返回更简单、更局部、更易优化。

只有需要动态生命周期、多态或稳定地址时，才优先考虑智能指针。

---

## 21. 工程实践建议

现代 C++ 接口可以按以下顺序选择：

```text
1. 能返回值，优先返回值 T
2. 需要表达无结果，使用 optional<T>
3. 需要表达错误，使用 expected<T, E> 或结果类型
4. 需要独占动态对象，使用 unique_ptr<T>
5. 确实需要共享所有权，使用 shared_ptr<T>
6. 只借用已有对象，使用引用或非拥有指针
7. 裸指针不要隐式表达所有权
```

C API 中建议：

```text
1. 明确谁分配、谁释放
2. 创建和销毁函数成对出现
3. 不跨模块混用 malloc/free 与 new/delete
4. 明确 NULL 语义
5. 明确返回指针的有效期
6. 优先使用调用者提供缓冲区或句柄
7. 跨 DLL/动态库时由同一模块负责分配和释放
```

---

## 22. 总结

C 指针返回的本质是：

```text
返回一个地址值
```

地址指向的对象可能位于不同存储区域，生命周期和所有权主要依靠人工约定。

C++ 值返回的本质是：

```text
返回一个对象值语义
```

对象的资源管理由构造、移动、复制、析构和作用域共同控制；编译器通过 RVO、NRVO、寄存器返回或隐藏返回地址，将值语义高效地映射到底层机器实现。

最重要的工程判断不是：

```text
值返回会不会复制？
```

而是：

```text
这个结果应该是独立对象、所有权转移、共享对象，还是临时借用？
```

现代 C++ 的推荐原则是：**普通计算结果优先值返回；需要动态所有权时使用智能指针；仅在明确借用语义时返回引用或非拥有指针。**
