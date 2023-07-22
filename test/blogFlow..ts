import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { TestObjectType } from './app.e2e-spec';

export function blogFlow(testObject: TestObjectType) {
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

  describe('BlogFlow', () => {
    let deleteBlogId = '';
    let postIdByBlogId = '';
    const notFound = '63f0e789e8f1762c4ba45f3e';

    it('get all blog status 200 (GET /blogs)', () => {
      return request(app.getHttpServer())
        .get('/blogs')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            pagesCount: null,
            totalCount: expect.any(Number),
            items: [
              {
                id: testObject.blogID,
                name: 'Test blog',
                description: 'My test blog',
                websiteUrl: 'polonezTestBlog.com',
                createdAt: expect.any(String),
                isMembership: expect.any(Boolean),
              },
            ],
          });
        });
    });

    it('get id blog status 200 (GET /blogs/:id)', () => {
      return request(app.getHttpServer())
        .get(`/blogs/${testObject.blogID}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: testObject.blogID,
            name: 'Test blog',
            description: 'My test blog',
            websiteUrl: 'polonezTestBlog.com',
            createdAt: expect.any(String),
            isMembership: expect.any(Boolean),
          });
        });
    });

    it('put id blog status 404 (PUT /blogger/blogs/:id)', () => {
      return request(app.getHttpServer())
        .put(`/blogger/blogs/${notFound}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          name: 'Test blog upd',
          description: 'My test blog update',
          websiteUrl: 'polonezUpdateTestBlog.com',
        })
        .expect(404);
    });

    it('put id blog status 204 (PUT /blogger/blogs/:id)', () => {
      return request(app.getHttpServer())
        .put(`/blogger/blogs/${testObject.blogID}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          name: 'Test blog upd',
          description: 'My test blog update',
          websiteUrl: 'polonezUpdateTestBlog.com',
        })
        .expect(204);
    });

    it('get id blogUpdate status 200 (GET /blogs/:id)', () => {
      return request(app.getHttpServer())
        .get(`/blogs/${testObject.blogID}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: testObject.blogID,
            name: 'Test blog upd',
            description: 'My test blog update',
            websiteUrl: 'polonezUpdateTestBlog.com',
            createdAt: expect.any(String),
            isMembership: expect.any(Boolean),
          });
        });
    });

    it('post new post by id blog status 201 (POST /blogger/blogs/:id/posts)', () => {
      return request(app.getHttpServer())
        .post(`/blogger/blogs/${testObject.blogID}/posts`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          title: 'Test post by blog',
          shortDescription: 'My test post by blog',
          content: 'My test content by blog',
        })
        .expect(201)
        .expect((res) => {
          postIdByBlogId = res.body.id;
        });
    });

    it('get post by id blog status 200 (GET /posts/:id)', () => {
      return request(app.getHttpServer())
        .get(`/posts/${postIdByBlogId}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: postIdByBlogId,
            title: 'Test post by blog',
            shortDescription: 'My test post by blog',
            content: 'My test content by blog',
            blogId: testObject.blogID,
            blogName: 'Test blog upd',
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

    it('post new deleteBlog status 201 (POST /blogger/blogs)', () => {
      return request(app.getHttpServer())
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .send({
          name: 'Delete blog',
          description: 'My delete blog',
          websiteUrl: 'polonezDeleteBlog.com',
        })
        .expect(201)
        .expect((res) => {
          deleteBlogId = res.body.id;
          expect(res.body).toEqual({
            id: expect.any(String),
            name: 'Delete blog',
            description: 'My delete blog',
            websiteUrl: 'polonezDeleteBlog.com',
            createdAt: expect.any(String),
            isMembership: expect.any(Boolean),
          });
        });
    });

    it('delete blog status 404 (DELETE /blogger/blogs/:id)', () => {
      return request(app.getHttpServer())
        .delete(`/blogger/blogs/${notFound}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(404);
    });

    it('delete blog status 204 (DELETE /blogs/:id)', () => {
      return request(app.getHttpServer())
        .delete(`/blogger/blogs/${deleteBlogId}`)
        .set('Authorization', `Bearer ${testObject.accessToken}`)
        .expect(204);
    });

    it('get id blogDelete status 404 (GET /blogs/:id)', () => {
      return request(app.getHttpServer())
        .get(`/blogs/${deleteBlogId}`)
        .expect(404);
    });
  });
}
