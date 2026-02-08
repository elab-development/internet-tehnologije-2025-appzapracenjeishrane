-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 08, 2026 at 09:49 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ishrana`
--

-- --------------------------------------------------------

--
-- Table structure for table `aktivnost`
--

CREATE TABLE `aktivnost` (
  `aktivnostId` bigint(20) NOT NULL,
  `nazivAktivnosti` varchar(50) DEFAULT NULL,
  `prosekKalorija` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `aktivnost`
--

INSERT INTO `aktivnost` (`aktivnostId`, `nazivAktivnosti`, `prosekKalorija`) VALUES
(1, 'Trcanje', 500.00);

-- --------------------------------------------------------

--
-- Table structure for table `hrana`
--

CREATE TABLE `hrana` (
  `hranaId` bigint(20) NOT NULL,
  `nazivHrane` varchar(50) DEFAULT NULL,
  `kalorije` decimal(10,2) DEFAULT NULL,
  `proteini` decimal(10,2) DEFAULT NULL,
  `masti` decimal(10,2) DEFAULT NULL,
  `ugljeniHidrati` decimal(10,2) DEFAULT NULL,
  `prihvacena` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hrana`
--

INSERT INTO `hrana` (`hranaId`, `nazivHrane`, `kalorije`, `proteini`, `masti`, `ugljeniHidrati`, `prihvacena`) VALUES
(1, 'banana', 89.00, 1.00, 0.30, 22.00, 1),
(2, 'Jaje', 140.00, 12.00, 10.00, 0.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `konzumiranahrana`
--

CREATE TABLE `konzumiranahrana` (
  `KHId` bigint(20) NOT NULL,
  `korisnik` bigint(20) DEFAULT NULL,
  `hrana` bigint(20) DEFAULT NULL,
  `datumKH` date DEFAULT NULL,
  `kolicina` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `konzumiranahrana`
--

INSERT INTO `konzumiranahrana` (`KHId`, `korisnik`, `hrana`, `datumKH`, `kolicina`) VALUES
(1, 6, 1, '2026-02-06', 200.00),
(2, 7, 0, '2026-02-06', 50.00),
(3, 6, 1, '2026-02-06', 67.00),
(4, 8, 2, '2026-02-07', 193.00);

-- --------------------------------------------------------

--
-- Table structure for table `korisnik`
--

CREATE TABLE `korisnik` (
  `korisnikId` bigint(20) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `sifra` varchar(255) DEFAULT NULL,
  `uloga` varchar(40) DEFAULT NULL,
  `tezina` decimal(10,2) DEFAULT NULL,
  `visina` decimal(10,2) DEFAULT NULL,
  `ime` varchar(50) DEFAULT NULL,
  `ciljnaTezina` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `korisnik`
--

INSERT INTO `korisnik` (`korisnikId`, `email`, `sifra`, `uloga`, `tezina`, `visina`, `ime`, `ciljnaTezina`) VALUES
(6, 'milos@gmail.com', '$2b$10$4ggIF0A.wbAFzsCXcvbHJ.Aye./DFYs8CXuZPoQEjmnteyq/Im6cK', 'OBICAN', NULL, NULL, 'Milos', NULL),
(7, 'iva@gmail.com', '$2b$10$SqcXefx3sWatuDJO2RL/3uWhkUsWQlv2dKrOlVFRJNKNRBfYoIsZ2', 'OBICAN', NULL, NULL, 'Iva', NULL),
(8, 'mijatovicc@gmail.com', '$2b$10$7eyc9xfn43RiMJUnuDJ1aehfolXoF0F5wQKUnL47.17guuffkZntW', 'OBICAN', NULL, NULL, 'anja', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `odradjeneaktivnosti`
--

CREATE TABLE `odradjeneaktivnosti` (
  `OAId` bigint(20) NOT NULL,
  `korisnik` bigint(20) DEFAULT NULL,
  `aktivnost` bigint(20) DEFAULT NULL,
  `trajanjeMin` decimal(10,0) DEFAULT NULL,
  `potroseneKalorije` decimal(10,0) DEFAULT NULL,
  `datumOA` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `odradjeneaktivnosti`
--

INSERT INTO `odradjeneaktivnosti` (`OAId`, `korisnik`, `aktivnost`, `trajanjeMin`, `potroseneKalorije`, `datumOA`) VALUES
(1, 8, 1, 5, 42, '2026-02-07'),
(2, 8, 1, 30, 250, '2026-02-07');

-- --------------------------------------------------------

--
-- Table structure for table `unosvode`
--

CREATE TABLE `unosvode` (
  `UVId` bigint(20) NOT NULL,
  `korisnik` bigint(20) DEFAULT NULL,
  `datum` date DEFAULT NULL,
  `kolicinaMl` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `unosvode`
--

INSERT INTO `unosvode` (`UVId`, `korisnik`, `datum`, `kolicinaMl`) VALUES
(1, 6, '2026-02-06', 2125),
(7, 6, '2026-02-07', 1250),
(11, 8, '2026-02-07', 250);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `aktivnost`
--
ALTER TABLE `aktivnost`
  ADD PRIMARY KEY (`aktivnostId`);

--
-- Indexes for table `hrana`
--
ALTER TABLE `hrana`
  ADD PRIMARY KEY (`hranaId`);

--
-- Indexes for table `konzumiranahrana`
--
ALTER TABLE `konzumiranahrana`
  ADD PRIMARY KEY (`KHId`),
  ADD KEY `vezaKorisnik1` (`korisnik`),
  ADD KEY `vezaHrana` (`hrana`);

--
-- Indexes for table `korisnik`
--
ALTER TABLE `korisnik`
  ADD PRIMARY KEY (`korisnikId`);

--
-- Indexes for table `odradjeneaktivnosti`
--
ALTER TABLE `odradjeneaktivnosti`
  ADD PRIMARY KEY (`OAId`),
  ADD KEY `vezaKorisnik` (`korisnik`),
  ADD KEY `vezaAktivnost` (`aktivnost`);

--
-- Indexes for table `unosvode`
--
ALTER TABLE `unosvode`
  ADD PRIMARY KEY (`UVId`),
  ADD UNIQUE KEY `uq_korisnik_datum` (`korisnik`,`datum`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `aktivnost`
--
ALTER TABLE `aktivnost`
  MODIFY `aktivnostId` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hrana`
--
ALTER TABLE `hrana`
  MODIFY `hranaId` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `konzumiranahrana`
--
ALTER TABLE `konzumiranahrana`
  MODIFY `KHId` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `korisnik`
--
ALTER TABLE `korisnik`
  MODIFY `korisnikId` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `odradjeneaktivnosti`
--
ALTER TABLE `odradjeneaktivnosti`
  MODIFY `OAId` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `unosvode`
--
ALTER TABLE `unosvode`
  MODIFY `UVId` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `konzumiranahrana`
--
ALTER TABLE `konzumiranahrana`
  ADD CONSTRAINT `vezaHrana` FOREIGN KEY (`hrana`) REFERENCES `hrana` (`hranaId`),
  ADD CONSTRAINT `vezaKorisnik1` FOREIGN KEY (`korisnik`) REFERENCES `korisnik` (`korisnikId`);

--
-- Constraints for table `odradjeneaktivnosti`
--
ALTER TABLE `odradjeneaktivnosti`
  ADD CONSTRAINT `vezaAktivnost` FOREIGN KEY (`aktivnost`) REFERENCES `aktivnost` (`aktivnostId`),
  ADD CONSTRAINT `vezaKorisnik` FOREIGN KEY (`korisnik`) REFERENCES `korisnik` (`korisnikId`);

--
-- Constraints for table `unosvode`
--
ALTER TABLE `unosvode`
  ADD CONSTRAINT `korisnikVeza` FOREIGN KEY (`korisnik`) REFERENCES `korisnik` (`korisnikId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
