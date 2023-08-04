import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { TestObjectType } from './app.e2e-spec';

export function banUserToBlogFlow(testObject: TestObjectType) {
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

  describe('BanUserToBlogFlow', () => {
    let userId1 = '';
    let blogId1 = '';
    const notFound = '63f0e789e8f1762c4ba45f3e';

    it('post new user1 status 201 (POST /users)', () => {
      return request(app.getHttpServer())
        .post('/sa/users')
        .set('Authorization', `Basic ${testObject.basic}`)
        .send({
          login: 'PolonezB',
          password: 'pass1234',
          email: 'testPolonezBanned@yandex.ru',
        })
        .expect(201)
        .expect((res) => {
          userId1 = res.body.id;
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
          blogId1 = res.body.id;
        });
    });

    it('ban user1 to blog1 status 204 (PUT /blogger/users/:id/ban)', () => {
      return request(app.getHttpServer())
        .put(`/blogger/users/${userId1}/ban`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          isBanned: true,
          banReason: 'stringstringstringstsdfsdfsdfsdfdsf',
          blogId: blogId1,
        })
        .expect(204);
    });

    it('get all banned user to blog status 200 (GET /blogger/users/blog/:id)', () => {
      return request(app.getHttpServer())
        .get(`/blogger/users/blog/${blogId1}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            pagesCount: expect.any(Number),
            page: expect.any(Number),
            pageSize: expect.any(Number),
            totalCount: expect.any(Number),
            items: [
              {
                id: userId1,
                login: 'PolonezB',
                banInfo: {
                  isBanned: true,
                  banDate: expect.any(String),
                  banReason: 'stringstringstringstsdfsdfsdfsdfdsf',
                },
              },
            ],
          });
        });
    });

    it('unban user1 to blog1 status 204 (PUT /blogger/users/:id/ban)', () => {
      return request(app.getHttpServer())
        .put(`/blogger/users/${userId1}/ban`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          isBanned: false,
          banReason: 'stringstringstringstsdfsdfsdfsdfdsf',
          blogId: blogId1,
        })
        .expect(204);
    });

    it('get all banned user to blog status 200 (GET /blogger/users/blog/:id)', () => {
      return request(app.getHttpServer())
        .get(`/blogger/users/blog/${blogId1}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            pagesCount: expect.any(Number),
            page: expect.any(Number),
            pageSize: expect.any(Number),
            totalCount: expect.any(Number),
            items: [],
          });
        });
    });
  });
}
