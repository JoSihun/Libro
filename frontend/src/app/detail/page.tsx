"use client";

import SubHeader from "@/components/SubHeader";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import DetailAnalyze from "@/components/components/detailAnalyze";
import { Button } from "@/components/ui/button";
import { FaPlus, FaStar } from "react-icons/fa6";
import { SearchApi } from "@/lib/axios-search";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import booksApi from "@/lib/axios-book";
import { ToastAction } from "@/components/ui/toast";

const DetailPage = () => {
  const URL = "ex0" + 0 + ".mp4";
  const isbn = useSearchParams().get("isbn");
  const ratingRef = useRef<HTMLDivElement>(null);
  const analyzeRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [bookLoading, setBookLoading] = useState<boolean>(false);
  const [bookDetail, setBookDetail] = useState<Book>({
    title: "",
    thumbnail: "",
    author: "",
    price: 0,
    publisher: "",
    pub_date: "",
    isbn: Number(isbn),
    summary: "",
    translator: null,
    updatedDate: "",
    createdDate: "",
    rating: 0,
    ratingCount: 0,
    id: 0,
    shortsUrl: "",
  });
  const [start, setStart] = useState<number>(1);
  const [curpage, setCurpage] = useState<number>(1);
  const [rating, setRating] = useState([
    {
      nickname: "A",
      email: "A0@A.com",
      rating: 1,
      comment: "정말 재미없어요",
      createdDate: "2022-01-03",
    },
    {
      nickname: "A",
      email: "A1@A.com",
      rating: 1,
      comment: "정말 재미없어요",
      createdDate: "2022-01-03",
    },
  ]);
  const [analyzePer, setAnalyzePer] = useState<number[]>([0, 0]);
  const [chartPer, setChartPer] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const [ratingPer, setRatingPer] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  const ratingPaging = (input: number, isNext: boolean) => {
    setStart(input);
    if (isNext) {
      setCurpage(Math.floor(input / 10) + 1);
    } else {
      setCurpage(Math.floor(input / 10) + 5);
    }
  };

  useEffect(() => {
    const currentScrollRef = scrollRef.current;
    const options = {
      root: currentScrollRef,
      threshold: 1,
    };

    if (currentScrollRef) {
      const observer = new IntersectionObserver(callback, options);
      if (analyzeRef.current) {
        observer.observe(analyzeRef.current);
      }
      if (chartRef.current) {
        observer.observe(chartRef.current);
      }
      if (ratingRef.current) {
        observer.observe(ratingRef.current);
      }

      return () => {
        if (currentScrollRef) {
          observer.unobserve(currentScrollRef);
        }
      };
    }
  }, [bookLoading]);
  const callback: IntersectionObserverCallback = (entries, observer) => {
    entries.forEach((element) => {
      if (element.isIntersecting) {
        if (element.target.id === "analyze") {
          setAnalyzePer([50, 100]);
        } else if (element.target.id === "chart") {
          setChartPer([10, 10, 20, 20, 5, 5, 5, 5, 5, 5, 5, 5]);
        } else if (element.target.id === "rating") {
          setRatingPer([4.75, 60, 20, 10, 5, 5]);
        }
        observer.unobserve(element.target);
      }
    });
  };

  useEffect(() => {
    const updateBookDetail = async () => {
      await booksApi
        .bookSearch("isbn", isbn, 0, 0)
        .then((response) => {
          // 데이터가 없는경우 등록
          if (response.data.length === 0 && isbn) {
            SearchApi.searchBooks(isbn, 1)
              .then(async (data) => {
                const bookOutput = {
                  title: data.items[0].title,
                  thumbnail: data.items[0].image,
                  author: data.items[0].author,
                  price: data.items[0].discount,
                  publisher: data.items[0].publisher,
                  pub_date: data.items[0].pubdate,
                  isbn: data.items[0].isbn,
                  summary: data.items[0].description,
                  translator: null,
                  updatedDate: "",
                  createdDate: "",
                  rating: 0,
                  ratingCount: 0,
                  id: 0,
                  shortsUrl: "",
                };
                await registerBook(bookOutput);
                setBookLoading(true);
              })
              .catch((err) => {
                toast({
                  description: "도서 정보를 불러오는데 실패했습니다.",
                });
                router.back();
                console.log(err);
              });
          }
          // DB에 도서 정보가 있을경우
          else {
            setBookDetail(response.data[0]);
            setBookLoading(true);
          }
        })
        .catch((error) => {
          toast({
            description: "도서 정보를 불러오는데 실패했습니다.",
          });
          console.log(error);
        });
    };

    const registerBook = async (bookOutput: Book) => {
      console.log("output", bookOutput);
      setBookDetail(bookOutput);
      const dateString: string = bookOutput.pub_date;
      const formattedDateString: string = `${dateString.slice(
        0,
        4
      )}-${dateString.slice(4, 6)}-${dateString.slice(6)}`;
      const isoDateTime: string = new Date(formattedDateString).toISOString();
      const addBook = {
        isbn: bookOutput.isbn,
        title: bookOutput.title,
        summary: bookOutput.summary,
        price: bookOutput.price,
        author: bookOutput.author,
        publisher: bookOutput.publisher,
        pubDate: isoDateTime,
        thumbnail: bookOutput.thumbnail,
      };
      // 도서 등록
      await booksApi
        .registerBook(addBook)
        .then((bookId) => {
          setBookDetail((prevState) => ({
            ...prevState,
            id: bookId,
          }));
        })
        .catch((error) => {
          console.error(error);
        });
    };
    updateBookDetail();
  }, []);

  const mappingBook = async (bookId: number) => {
    booksApi
      .userBookMapping({ bookId: bookId, type: "관심" })
      .then(() => {
        toast({
          title: "나의 서재에 도서를 담았습니다.",
          description: "나의 서재로 이동하시겠습니까?",
          action: (
            <ToastAction
              altText="move"
              toastActionClick={() => {
                router.push("/library");
              }}
            >
              이동
            </ToastAction>
          ),
        });
      })
      .catch((error) => {
        toast({
          title: "나의 서재에 도서를 담는데 실패했습니다.",
          description: "잠시 후 다시 시도해주세요.",
        });
      });
  };

  return (
    <>
      <SubHeader title="도서 상세 정보" backArrow={true} />
      <div
        ref={scrollRef}
        className="pt-24 h-full bg-white max-h-screen flex items-center relative flex-wrap overflow-y-scroll scrollbar-hide"
      >
        {bookLoading ? (
          <div className="w-full h-full min-h-screen bg-white flex flex-col relative overflow-hidden mb-24">
            <div
              className="w-full h-40 flex relative"
              style={{
                backgroundImage: `url(${bookDetail.thumbnail})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="w-full h-full backdrop-blur-lg backdrop-brightness-75 flex absolute pr-2">
                <Image
                  src={bookDetail.thumbnail}
                  alt=""
                  width={100}
                  height={200}
                  className="px-3 py-4 select-none"
                />
                <div className="flex items-end mb-4">
                  <div className="flex flex-col">
                    <p className="text-white font-semibold text-lg line-clamp-3">
                      {bookDetail.title}
                    </p>
                    <p className="text-gray-300 text-xs mt-1">
                      저자 {bookDetail.author.split("^").join(", ")} | 출판사{" "}
                      {bookDetail.publisher}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-full px-6">
              {bookDetail.shortsUrl && (
                <>
                  <p className="mt-4 mb-3 text-lg text-gray-800 font-semibold">
                    트레일러
                  </p>
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-[64vh] rounded-lg object-cover"
                  >
                    <source src={bookDetail.shortsUrl} type="video/mp4" />
                  </video>
                </>
              )}

              <div className="mt-8 w-full h-fit">
                <p className="text-lg text-gray-800 font-semibold">책 소개</p>
                <hr className="mt-2 mb-3" />
                <p className="text-xs text-gray-600 leading-6 indent-1.5">
                  {bookDetail.summary}
                </p>
              </div>

              <div className="mt-8 w-full h-fit">
                <p className="text-lg text-gray-800 font-semibold">기본 정보</p>
                <hr className="mt-2 mb-3" />
                <div className="flex flex-wrap text-sm text-gray-600">
                  <p className="w-1/3 my-1">ISBN</p>
                  <p className="w-2/3 my-1">{bookDetail.isbn}</p>
                  <p className="w-1/3 my-1">발행 일자</p>
                  <p className="w-2/3 my-1">{bookDetail.pub_date}</p>
                  <p className="w-1/3 my-1">가격</p>
                  <p className="w-2/3 my-1">{bookDetail.price}원</p>
                </div>
              </div>

              {/* 분석 */}
              <div className="mt-8 w-full h-fit">
                <p className="text-lg text-gray-800 font-semibold">분석</p>
                <hr className="mt-2 mb-4" />
                <div ref={analyzeRef} id="analyze">
                  <div className="w-full flex justify-between px-1 pb-1">
                    <Label className="text-sm text-gray-800 flex items-center">
                      완독율
                    </Label>
                    <Label className="text-lg text-gray-800">
                      {analyzePer[1] === 0
                        ? 0
                        : (analyzePer[0] / analyzePer[1]) * 100}
                      %
                    </Label>
                  </div>
                  <Progress
                    indicatorColor="rounded-full bg-[#9268EB] duration-1000"
                    value={(analyzePer[0] / analyzePer[1]) * 100}
                  />
                  <div className="w-full px-1 flex justify-between pt-1">
                    <Label className="text-xs text-[#666666]">
                      완독 수 {analyzePer[0]}
                    </Label>
                    <Label className="ml-4 text-xs text-[#666666]">
                      담은 수 {analyzePer[1]}
                    </Label>
                  </div>
                  <div className="w-full flex justify-between px-1 pb-1 mt-6 flex-wrap">
                    <Label className="text-xs text-gray-800 font-semibold pb-2">
                      성별 / 연령대 분석
                    </Label>
                    <div
                      ref={chartRef}
                      className="w-full h-36 flex justify-between"
                      id="chart"
                    >
                      <div className="w-full h-36 flex flex-col absolute justify-between my-2">
                        <hr className="w-5/6 border-gray-300 mx-6" />
                        <hr className="w-5/6 border-gray-300 mx-6" />
                        <hr className="w-5/6 border-gray-300 mx-6" />
                        <hr className="w-5/6 border-gray-300 mx-6" />
                        <hr className="w-5/6 border-gray-300 mx-6" />
                      </div>
                      <div className="text-xs flex w-full justify-between pr-2">
                        <div className="h-40 flex flex-col justify-between">
                          <p className="text-right">100</p>
                          <p className="text-right">75</p>
                          <p className="text-right">50</p>
                          <p className="text-right">25</p>
                          <p className="text-right">0</p>
                        </div>
                        <DetailAnalyze
                          male={chartPer[0]}
                          female={chartPer[1]}
                          isLeft={false}
                          description="10대"
                        />
                        <DetailAnalyze
                          male={chartPer[2]}
                          female={chartPer[3]}
                          isLeft={false}
                          description="20대"
                        />
                        <DetailAnalyze
                          male={chartPer[4]}
                          female={chartPer[5]}
                          isLeft={false}
                          description="30대"
                        />
                        <DetailAnalyze
                          male={chartPer[6]}
                          female={chartPer[7]}
                          isLeft={true}
                          description="40대"
                        />
                        <DetailAnalyze
                          male={chartPer[8]}
                          female={chartPer[9]}
                          isLeft={true}
                          description="50대"
                        />
                        <DetailAnalyze
                          male={chartPer[10]}
                          female={chartPer[11]}
                          isLeft={true}
                          description="60대 이상"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 리뷰 */}
              <div className="mt-8 w-full h-fit">
                <p className="text-lg text-gray-800 font-semibold">리뷰</p>
                <hr className="mt-2 mb-3" />
              </div>
              <div className="flex items-center mb-2">
                <FaStar className="w-6 h-6 text-yellow-300 me-1" />
                <FaStar className="w-6 h-6 text-yellow-300 me-1" />
                <FaStar className="w-6 h-6 text-yellow-300 me-1" />
                <FaStar className="w-6 h-6 text-yellow-300 me-1" />
                <FaStar className="w-6 h-6 text-gray-300 me-1" />
                <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {ratingPer[0]}
                </p>
                <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  /
                </p>
                <p className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  5점
                </p>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {bookDetail.ratingCount == null ? 0 : bookDetail.ratingCount}{" "}
                개의 리뷰가 있습니다.
              </p>
              <div className="flex items-center mt-4">
                <p className="text-sm w-4 font-medium text-blue-600 dark:text-blue-500 select-none">
                  5
                </p>
                <Progress
                  className="ml-2 mr-4"
                  indicatorColor="bg-yellow-300 w-full h-5 rounded-full duration-1000"
                  value={ratingPer[1]}
                />
                <p className="text-sm w-8 text-end font-medium text-gray-500 dark:text-gray-400">
                  70%
                </p>
              </div>
              <div className="flex items-center mt-4">
                <p className="text-sm w-4 font-medium text-blue-600 dark:text-blue-500 select-none">
                  4
                </p>
                <Progress
                  className="ml-2 mr-4"
                  indicatorColor="bg-yellow-300 w-full h-5 rounded-full duration-1000"
                  value={ratingPer[2]}
                />
                <p className="text-sm w-8 text-end font-medium text-gray-500 dark:text-gray-400">
                  17%
                </p>
              </div>
              <div
                ref={ratingRef}
                className="flex items-center mt-4"
                id="rating"
              >
                <p className="text-sm w-4 font-medium text-blue-600 dark:text-blue-500 select-none">
                  3
                </p>
                <Progress
                  className="ml-2 mr-4"
                  indicatorColor="bg-yellow-300 w-full h-5 rounded-full duration-1000"
                  value={ratingPer[3]}
                />
                <p className="text-sm w-8 text-end font-medium text-gray-500 dark:text-gray-400">
                  8%
                </p>
              </div>
              <div className="flex items-center mt-4">
                <p className="text-sm w-4 font-medium text-blue-600 dark:text-blue-500 select-none">
                  2
                </p>
                <Progress
                  className="ml-2 mr-4"
                  indicatorColor="bg-yellow-300 w-full h-5 rounded-full duration-1000"
                  value={ratingPer[4]}
                />
                <p className="text-sm w-8 text-end font-medium text-gray-500 dark:text-gray-400">
                  4%
                </p>
              </div>
              <div className="flex items-center mt-4">
                <p className="text-sm w-4 font-medium text-blue-600 dark:text-blue-500 select-none">
                  1
                </p>
                <Progress
                  className="ml-2 mr-4"
                  indicatorColor="bg-yellow-300 w-full h-5 rounded-full duration-1000"
                  value={ratingPer[5]}
                />
                <p className="text-sm w-8 text-end font-medium text-gray-500 dark:text-gray-400">
                  4%
                </p>
              </div>
              <div className="mt-8 w-full h-fit pl-1">
                {/* 리뷰 */}
                {rating
                  .slice((curpage - 1) * 10, (curpage - 1) * 10 + 10)
                  .map((key, index) => (
                    <div
                      key={key.email}
                      className="flex flex-col justify-between bg-white border border-gray-200 w-full h-28 rounded-lg drop-shadow-md p-4 my-4"
                    >
                      <p className="font-semibold text-sm">
                        {key.nickname} {key.email} | {key.createdDate}
                      </p>
                      <div className="flex">
                        <FaStar className="w-5 h-5 text-yellow-300 me-1" />
                        <FaStar className="w-5 h-5 text-yellow-300 me-1" />
                        <FaStar className="w-5 h-5 text-yellow-300 me-1" />
                        <FaStar className="w-5 h-5 text-yellow-300 me-1" />
                        <FaStar className="w-5 h-5 text-gray-300 me-1" />
                      </div>
                      <p className="text-sm">{key.comment}</p>
                    </div>
                  ))}
              </div>
              <Pagination>
                <PaginationContent>
                  {/* 이전 버튼 */}
                  {start != 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        className="rounded-full"
                        onClick={() => {
                          ratingRef.current?.scrollIntoView({
                            behavior: "smooth",
                          });
                          ratingPaging(start - 50, false);
                        }}
                      />
                    </PaginationItem>
                  )}
                  {/* 페이지 버튼 */}
                  {Array.from(
                    {
                      length:
                        start + 49 <= rating.length
                          ? 5
                          : Math.ceil((rating.length % 50) / 10),
                    },
                    (_, index) => (
                      <div key={index}>
                        <PaginationItem>
                          <PaginationLink
                            className={
                              index === (curpage - 1) % 5
                                ? "cursor-default bg-[#9268EB] hover:bg-[#684ba6] text-white hover:text-white rounded-full"
                                : "cursor-pointer rounded-full"
                            }
                            onClick={() => {
                              ratingRef.current?.scrollIntoView({
                                behavior: "smooth",
                              });
                              setCurpage(index + 1 + Math.round(start / 10));
                              console.log(index + 1 + Math.round(start / 10));
                            }}
                            isActive={index === (curpage - 1) % 5}
                          >
                            {index + 1 + Math.round(start / 10)}
                          </PaginationLink>
                        </PaginationItem>
                      </div>
                    )
                  )}
                  {/* 다음 버튼 */}
                  {start + 50 <= rating.length && (
                    <PaginationItem>
                      <PaginationNext
                        className="rounded-full scale-50"
                        onClick={() => {
                          ratingRef.current?.scrollIntoView({
                            behavior: "smooth",
                          });
                          ratingPaging(start + 50, true);
                        }}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-3 w-full min-h-[84vh]">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <Skeleton className="h-[360px] w-full rounded-xl" />
          </div>
        )}

        {bookLoading && !!localStorage.getItem("accessToken") && (
          <Button
            className="bg-[#9268EB] hover:bg-[#bfa1ff] sticky bottom-20 left-full max-w-md drop-shadow-lg rounded-full z-20 w-12 h-12 mr-3"
            onClick={() => mappingBook(bookDetail.id)}
          >
            <FaPlus size={30} />
          </Button>
        )}
      </div>
    </>
  );
};
export default DetailPage;
