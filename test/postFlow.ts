import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { TestObjectType } from './app.e2e-spec';

export function postFlow(testObject: TestObjectType) {
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

  describe('PostFlow', () => {
    let deletePostId = '';
    const notFound = '63f0e789e8f1762c4ba45f3e';

    it('get all posts status 200 (GET /posts)', () => {
      return request(app.getHttpServer())
        .get('/posts')
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            pagesCount: null,
            totalCount: expect.any(Number),
            items: [
              {
                id: testObject.postID,
                title: 'Test post',
                shortDescription: 'My test post',
                content: 'My test content',
                blogId: testObject.blogID,
                blogName: expect.any(String),
                createdAt: expect.any(String),
                extendedLikesInfo: {
                  likesCount: expect.any(Number),
                  dislikesCount: expect.any(Number),
                  myStatus: expect.any(String),
                  newestLikes: expect.any(Array),
                },
              },
            ],
          });
        });
    });

    it('put id post status 404 (PUT /posts/:id)', () => {
      return request(app.getHttpServer())
        .put(`/posts/${notFound}`)
        .set('Authorization', `Basic ${testObject.basic}`)
        .send({
          title: 'Test update post',
          shortDescription: 'My update post',
          content: 'My test update content',
          blogId: testObject.blogID,
        })
        .expect(404);
    });
    it('put id post status 204 (PUT /posts/:id)', () => {
      return request(app.getHttpServer())
        .put(`/posts/${testObject.postID}`)
        .set('Authorization', `Basic ${testObject.basic}`)
        .send({
          title: 'Test update post',
          shortDescription: 'My update post',
          content: 'My test update content',
          blogId: testObject.blogID,
        })
        .expect(204);
    });
    it('get id post update status 200 (GET /posts/:id)', () => {
      return request(app.getHttpServer())
        .get(`/posts/${testObject.postID}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: testObject.postID,
            title: 'Test update post',
            shortDescription: 'My update post',
            content: 'My test update content',
            blogId: testObject.blogID,
            blogName: expect.any(String),
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: expect.any(Number),
              dislikesCount: expect.any(Number),
              myStatus: expect.any(String),
              newestLikes: expect.any(Array),
            },
          });
        });
    });
    it('post new deletePost status 201 (POST /posts)', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Basic ${testObject.basic}`)
        .send({
          title: 'Test delete post',
          shortDescription: 'My delete post',
          content: 'My delete content',
          blogId: testObject.blogID,
        })
        .expect(201)
        .expect((res) => {
          deletePostId = res.body.id;
          expect(res.body).toEqual({
            id: expect.any(String),
            title: 'Test delete post',
            shortDescription: 'My delete post',
            content: 'My delete content',
            blogId: testObject.blogID,
            blogName: expect.any(String),
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: expect.any(Number),
              dislikesCount: expect.any(Number),
              myStatus: expect.any(String),
              newestLikes: expect.any(Array),
            },
          });
        });
    });

    it('delete post status 404 (DELETE /posts/:id)', () => {
      return request(app.getHttpServer())
        .delete(`/posts/${notFound}`)
        .set('Authorization', `Basic ${testObject.basic}`)
        .expect(404);
    });

    it('delete post status 204 (DELETE /posts/:id)', () => {
      return request(app.getHttpServer())
        .delete(`/posts/${deletePostId}`)
        .set('Authorization', `Basic ${testObject.basic}`)
        .expect(204);
    });

    it('get id postDelete status 404 (GET /posts/:id)', () => {
      return request(app.getHttpServer())
        .get(`/posts/${deletePostId}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(404);
    });
  });
}
