import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { TestObjectType } from './app.e2e-spec';

export function startFlow(): TestObjectType {
  const testObject: TestObjectType = {
    basic: 'YWRtaW46cXdlcnR5',
    accessToken: ' ',
    refreshToken: ' ',
    userID: ' ',
    blogID: ' ',
    postID: ' ',
  };

  enum MyLikeStatus {
    None = 'None',
    Like = 'Like',
    Dislike = 'Dislike',
  }

  let app: INestApplication;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('startFlow', () => {
    it('server start (GET /)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Server is up!');
    });

    it('clear base (DELETE /testing/all-data)', () => {
      return request(app.getHttpServer())
        .delete('/testing/all-data')
        .expect(204);
    });

    it('post new user status 201 (POST /users)', () => {
      return request(app.getHttpServer())
        .post('/sa/users')
        .set('Authorization', `Basic ${testObject.basic}`)
        .send({
          login: 'Polonez',
          password: 'pass1234',
          email: 'testPolonez@yandex.ru',
        })
        .expect(201)
        .expect((res) => {
          testObject.userID = res.body.id;
          return {
            id: res.body.id,
            login: 'Polonez',
            email: 'testPolonez@yandex.ru',
            createdAt: res.body.createdAt,
            banInfo: {
              isBanned: expect.any(Boolean),
              banDate: expect.any(String),
              banReason: expect.any(String),
            },
          };
        });
    });

    it('post aut user and get tokens status 200 (POST /auth/login)', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'Polonez',
          password: 'pass1234',
        })
        .expect(200)
        .expect((res) => {
          testObject.accessToken = res.body['accessToken'];
          testObject.refreshToken = res.headers['set-cookie'][0];
        });
    });

    it('post new blog status 201 (POST /blogger/blogs)', () => {
      return request(app.getHttpServer())
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          name: 'Test blog',
          description: 'My test blog',
          websiteUrl: 'polonezTestBlog.com',
        })
        .expect(201)
        .expect((res) => {
          testObject.blogID = res.body.id;
          expect(res.body).toEqual({
            id: expect.any(String),
            name: 'Test blog',
            description: 'My test blog',
            websiteUrl: 'polonezTestBlog.com',
            createdAt: expect.any(String),
            isMembership: expect.any(Boolean),
          });
        });
    });

    it('post new post of blog status 201 (POST /blogger/blogs/:id/posts)', () => {
      return request(app.getHttpServer())
        .post(`/blogger/blogs/${testObject.blogID}/posts`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          title: 'Test post',
          shortDescription: 'My test post',
          content: 'My test content',
        })
        .expect(201)
        .expect((res) => {
          testObject.postID = res.body.id;
          expect(res.body).toEqual({
            id: expect.any(String),
            title: 'Test post',
            shortDescription: 'My test post',
            content: 'My test content',
            blogId: testObject.blogID,
            blogName: 'Test blog',
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: MyLikeStatus.None,
              newestLikes: [],
            },
          });
        });
    });
  });
  return testObject;
}
