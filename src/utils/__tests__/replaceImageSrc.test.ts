import { describe, expect, it } from "vitest";
import { replaceImageSrc } from "../parsePostFields";

describe("replaceImageSrc", () => {
  it("imageId가 일치하는 이미지 URL을 src로 주입한다", () => {
    const content = '<p>본문</p><img imageId="2"><img imageId="1">';
    const images = [
      { imageId: 1, imageUrl: "/one.jpg" },
      { imageId: 2, imageUrl: "/two.jpg" },
    ];

    expect(replaceImageSrc(content, images)).toBe(
      '<p>본문</p><img imageId="2" src="/two.jpg"><img imageId="1" src="/one.jpg">'
    );
  });

  it("imageId에 해당하는 이미지가 없으면 기존 태그를 유지한다", () => {
    const content = '<img imageId="3">';

    expect(
      replaceImageSrc(content, [{ imageId: 1, imageUrl: "/one.jpg" }])
    ).toBe(content);
  });

  it("기존 src가 있으면 imageId와 일치하는 이미지 URL로 교체한다", () => {
    const content = '<img src="blob:preview" imageId="1">';

    expect(
      replaceImageSrc(content, [{ imageId: 1, imageUrl: "/one.jpg" }])
    ).toBe('<img src="/one.jpg" imageId="1">');
  });
});
