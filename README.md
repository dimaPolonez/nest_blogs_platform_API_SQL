# Проект: NestBlogPlatform API SQL
### О проекте
Реализация API Блогера, со следующим функционалом:
<ol>
<li>Полноценная авторизация и регистрация. Работа с почтовыми ящиками(nodeMailer) и кодами активации учетной записи(uuid). Работа с шифрованием паролей пользователя(bcrypt). Работа с различными сессиями пользователя. Работа с Access и Refresh токенами(jwt)</li>
<li>Реализованы роли superAdmin и blogger, а также публичная часть</li>
<ul>
<li>superAdmin может - банить/разбанить блог(все посты такого блога не отображаются в публичной части)</li>
<li>superAdmin может - привязать юзера к блогу(если у блога нету владельца)</li>
<li>superAdmin может - банить/разбанить юзера(забаненный не может логинится, все сессии становятся не валидными, все посты, комментарии и лайки не видны и не подсчитываются)</li>
<li>superAdmin может - создавать и удалять юзеров</li>
<li>superAdmin может - получать расширенную информацию о всех блогах и юзерах</li>
</ul>
<ul>
<li>blogger может - CRUD блога и постов</li>
<li>blogger может - банить/разбанить любого пользователя для каждого из своих блогов(забаненный не может комментировать посты того блога для которого он забанен)</li>
<li>blogger может - получать информацию о забаненных пользователях, для каждого из своих блогов</li>
<li>blogger может - получать информацию о своих блогах и постах, а также одним запросов получать все комментарии которые относятся к его блогам и постам</li>
</ul>
<ul>
<li>Публичная часть - CRUD комментариев</li>
<li>Публичная часть - Возможность ставить лайки и дизлайки комментариям, а также отменять их</li>
<li>Публичная часть - Возможность получать все комментарии и если пользователь авторизован видеть свою реакцию на них</li>
<li>Публичная часть - Возможность ставить лайки и дизлайки постам, а также отменять их</li>
<li>Публичная часть - Возможность получать все посты и если пользователь авторизован видеть свою реакцию на них, а также последних 3 пользователей поставивших Like</li>
<li>Публичная часть - Возможность получать информацию о всех блогах, о себе и своих сессиях(если авторизован)</li>
</ul>
<li>Все GET запросы на получение массива данных, поддерживают пагинацию, которую можно задавать через URI параметры</li>
<li>Весь проект, на всех стадиях проводит валидацию входящих данных(dto, class-validator) и запрограммированы исключения в случае если данные неправильные(400), не найдены(404), защищены(401), или пользователь пытается работать не со своими данными(403)</li>
</ol>

### Стек технологий:
Nest, postgreSQL, typeorm, typeScript, cqrs, jwt, bcrypt, jest, supertest
### Заметки разработчика:
1. Весь проект реализован на Nest и TypeScript(причем any в коде вы скорее всего не найдете)
2. Авторизация и регистрация сделана через nodemailer, через gmail transport со всем стеком восстановления пароля и почты, повторной отправки кода и проверкой на уникальности логина и почты при регистрации
3. Исключения улетают на фронт, определенного вида, реализовал с помощью настройки exception фильтра
4. Весь проект реализован в логически выстроенных раздельных модулях с минимальной завязкой между собой, никаких циклических зависимостей или избыточнх модулей
5. Все сервисы раздроблены на отдельные use-cases, через commandBus
6. Защищенность ендпоинтов, реализована через локальные стратегии Nest, Local(для начальной авторизации), Access, Refresh, Basic(для superAdmin). Также есть Quest, это мой самодельный костыль для реализации логики получения реакции на пост или коммент пользователя зашедшего с токеном на незащещенный ендпоинт. Таким образом если у пользователя есть токен, то покажется его реакция, если пользователь не авторизован, то покажется None. Мне просто хотелось, чтобы все было реализовано через стратегии
7. Access токен отдается в качестве response, а Refresh зашивается в Cookie not only, время жизни 10 минут и 10 часов соответственно
8. Защита от DDOS, реализована через встроенный throttler от Nest, не больше 5 запросов за 10 секунд и стоит только на ендпоинтах связанными с почтой и отправкой писем
9. Работа со скрытыми данными, настройками и паролями, реализована через файл config и env файл локально и удаленно
10. Есть тесты покрывающие часть логики в основном e2e
11. Работа над проектом велась, по предоставленной Swagger документации из которой взяты все требования к входящим данным и эти требования проверяются на уровне dto(с помощью стандартных декораторов, а также самописных валидирующих классах) и на уровне БД
12. Запросы в БД, реализованы через RAWSql, для большей практики именно с обычными SQL запросами. В проекте реализован обычный repository, для внутренней работы связанной больше с CRUD операциями, а также реализован queryRepository для более быстрой работы GET запросов напрямую, обходя дополнительную логику сервисов и use-cases.
12. Сложность запросов небольшая в обычных репозиториях (и моё субьективное мнение)средняя в Query репозиториях. 
<ul>
Самые сложные запросы:
<li>Получить все посты - запрос включал в себя 3 агрегатных функции на подсчет лайков, дизлайков для каждого поста, а также всех записей + для каждого поста формировался массив 3 последних лайков, с 3 полями для каждого юзера и сортировкой и отдавался он в формате JSON, помимо этого нужно проверять забанен ли блог и произвести группировку, сортировку и пагинацию. Интересный запрос в качестве работы с массивами в SQL</li>
<li>Получить все комментарии, всех пользователей со всех блогов и постов конкретного блогера - запрос включал в себя связку 4 таблиц, 3 агрегаций(лайки, дизлайки и общее количество для всех комментов), проверку на доступ к этим данным, на то забанен ли юзер, а также группировку, сортировку и пагинацию. Интересный запрос в качестве самой проблемы</li>
</ul>
12. Код полностью асинхронный(async/await) и легкочитаемый, структура папок выбрана мной исходя из практик подобных проектов других более опытных разработчиков.
